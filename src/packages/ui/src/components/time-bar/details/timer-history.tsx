// components/time-bar/details/timer-history.tsx
'use client'

import {
  addSeconds,
  differenceInSeconds,
  format,
  isAfter,
  parseISO,
  setHours,
  setMinutes,
  subSeconds,
} from 'date-fns'
import {
  Calendar,
  Check,
  Clock,
  Database,
  History,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import React, { memo, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useClient } from '@/hooks'
import { cn } from '@/lib/utils'
import { useSyncStore } from '@/stores/syncStore'
import { JournalEntry, useTimeEntryStore } from '@/stores/timeEntryStore'

// ---------------------------------------------------------------------------
// TIPAGEM DOS BLOCOS LÓGICOS DA LINHA DO TEMPO
// ---------------------------------------------------------------------------
type TimelineBlock =
  | { type: 'start'; entry: JournalEntry; index: number }
  | { type: 'adjustment'; entry: JournalEntry; index: number }
  | { type: 'stop'; entry: JournalEntry; index: number }
  | {
      type: 'pause-ongoing'
      paused: JournalEntry
      pauseIndex: number
    }
  | {
      type: 'pause-block'
      paused: JournalEntry
      resumed: JournalEntry
      pauseIndex: number
      resumeIndex: number
      durationSeconds: number
    }

// ---------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ---------------------------------------------------------------------------
function formatDuration(totalSeconds: number) {
  const absSeconds = Math.abs(totalSeconds)
  const h = Math.floor(absSeconds / 3600)
  const m = Math.floor((absSeconds % 3600) / 60)
  const s = absSeconds % 60

  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)

  return parts.join(' ')
}

function applyTimeToDate(dateString: string, timeString: string): string {
  const date = parseISO(dateString)
  const [hours, minutes] = timeString.split(':').map(Number)
  return setMinutes(setHours(date, hours), minutes).toISOString()
}

export const TimerHistory = memo(() => {
  const client = useClient()
  const db = useSyncStore((s) => s.db)
  const activeEntry = useTimeEntryStore((s) => s.active)
  const setActive = useTimeEntryStore((s) => s.setActive)

  // Estados de Edição Inline
  const [isAddingInline, setIsAddingInline] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Estados de Validação
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  // Estados dos Formulários Inline (Pausa)
  const [inlineStartTime, setInlineStartTime] = useState('')
  const [inlineEndTime, setInlineEndTime] = useState('')

  // Estados dos Formulários Inline (Edição de Ajuste)
  const [inlineAdjType, setInlineAdjType] = useState<'add' | 'subtract'>('add')
  const [inlineAdjMinutes, setInlineAdjMinutes] = useState('')
  const [inlineAdjNote, setInlineAdjNote] = useState('')

  // Estados dos Formulários Inline (Novo Ajuste)
  const [addType, setAddType] = useState<'add' | 'subtract'>('add')
  const [addMinutes, setAddMinutes] = useState<string>('')
  const [addNote, setAddNote] = useState('')

  // ---------------------------------------------------------------------------
  // PROCESSAMENTO: Transforma os eventos raw do banco em Blocos Lógicos
  // ---------------------------------------------------------------------------
  const timeline = useMemo(() => {
    if (!activeEntry || !activeEntry.journal) return []

    const blocks: TimelineBlock[] = []
    const journal = activeEntry.journal

    for (let i = 0; i < journal.length; i++) {
      const entry = journal[i]

      if (entry.event === 'started') {
        blocks.push({ type: 'start', entry, index: i })
      } else if (entry.event === 'adjusted') {
        blocks.push({ type: 'adjustment', entry, index: i })
      } else if (entry.event === 'stopped') {
        blocks.push({ type: 'stop', entry, index: i })
      } else if (entry.event === 'paused') {
        const next = journal[i + 1]
        if (next && next.event === 'resumed') {
          const duration = differenceInSeconds(
            parseISO(next.at),
            parseISO(entry.at),
          )
          blocks.push({
            type: 'pause-block',
            paused: entry,
            resumed: next,
            pauseIndex: i,
            resumeIndex: i + 1,
            durationSeconds: duration,
          })
          i++
        } else {
          blocks.push({
            type: 'pause-ongoing',
            paused: entry,
            pauseIndex: i,
          })
        }
      }
    }
    return blocks.reverse()
  }, [activeEntry])

  // ---------------------------------------------------------------------------
  // VALIDAÇÕES
  // ---------------------------------------------------------------------------
  const isDeleteSafe = (block: TimelineBlock): boolean => {
    if (!activeEntry || !activeEntry.startDate) return false
    const currentStartDate = parseISO(activeEntry.startDate)
    const now = new Date()

    if (block.type === 'adjustment') {
      const newStartDate = addSeconds(
        currentStartDate,
        block.entry.secondsAtEvent,
      )
      return !isAfter(newStartDate, now)
    }

    if (block.type === 'pause-block') {
      const newStartDate = subSeconds(currentStartDate, block.durationSeconds)
      return !isAfter(newStartDate, now)
    }

    return true
  }

  // ---------------------------------------------------------------------------
  // AÇÕES: DELETAR, EDITAR (INLINE), ADICIONAR
  // ---------------------------------------------------------------------------
  const syncStoreAndElectron = async (
    newJournal: JournalEntry[],
    newStartDate: string,
    newStatus: 'running' | 'paused' | 'finished',
  ) => {
    if (!db || !activeEntry) return

    const doc = await db.timeEntries.findOne(activeEntry._id).exec()
    if (doc) {
      await doc.patch({
        journal: newJournal,
        startDate: newStartDate,
        timeStatus: newStatus,
        updatedAt: new Date().toISOString(),
      })
    }

    setActive({
      ...activeEntry,
      journal: newJournal,
      startDate: newStartDate,
      timeStatus: newStatus,
    })

    if (newStatus === 'running') {
      const elapsed = differenceInSeconds(new Date(), parseISO(newStartDate))
      client.timer.start({
        initialSeconds: Math.max(0, elapsed),
        mode: activeEntry.timerConfig?.mode ?? 'countup',
      })
    }
  }

  const handleDelete = async (block: TimelineBlock) => {
    if (!activeEntry) return

    const newJournal = [...(activeEntry.journal || [])]
    const currentStartDate = parseISO(activeEntry.startDate!)
    let newStartDate = currentStartDate.toISOString()
    let newStatus: 'running' | 'paused' | 'finished' =
      (activeEntry.timeStatus as 'running' | 'paused' | 'finished') || 'paused'

    if (block.type === 'pause-block') {
      newJournal.splice(block.resumeIndex, 1)
      newJournal.splice(block.pauseIndex, 1)
      newStartDate = subSeconds(
        currentStartDate,
        block.durationSeconds,
      ).toISOString()
    } else if (block.type === 'pause-ongoing') {
      newJournal.splice(block.pauseIndex, 1)
      newStatus = 'running'
    } else if (block.type === 'adjustment') {
      newJournal.splice(block.index, 1)
      newStartDate = addSeconds(
        currentStartDate,
        block.entry.secondsAtEvent,
      ).toISOString()
    }

    if (isAfter(parseISO(newStartDate), new Date())) {
      return
    }

    await syncStoreAndElectron(newJournal, newStartDate, newStatus)
  }

  const startInlineEditPause = (
    block: TimelineBlock & { type: 'pause-block' },
  ) => {
    setInlineError(null)
    setInlineStartTime(format(parseISO(block.paused.at), 'HH:mm'))
    setInlineEndTime(format(parseISO(block.resumed.at), 'HH:mm'))
    setEditingIndex(block.pauseIndex)
  }

  const handleInlineEditPauseSave = async (
    block: TimelineBlock & { type: 'pause-block' },
  ) => {
    if (!activeEntry) return

    const newJournal = [...(activeEntry.journal || [])]
    const currentStartDate = parseISO(activeEntry.startDate!)

    const newPausedAt = applyTimeToDate(block.paused.at, inlineStartTime)
    const newResumedAt = applyTimeToDate(block.resumed.at, inlineEndTime)

    const newDurationSeconds = differenceInSeconds(
      parseISO(newResumedAt),
      parseISO(newPausedAt),
    )

    if (newDurationSeconds < 0) {
      setInlineError('O horário de fim não pode ser anterior ao início.')
      return
    }

    const durationDelta = newDurationSeconds - block.durationSeconds
    const newStartDate = addSeconds(
      currentStartDate,
      durationDelta,
    ).toISOString()

    if (isAfter(parseISO(newStartDate), new Date())) {
      const totalRecorded = differenceInSeconds(new Date(), currentStartDate)
      setInlineError(
        `A nova pausa remove ${formatDuration(durationDelta)} adicionais, mas o tempo atual registrado é de apenas ${formatDuration(totalRecorded)}.`,
      )
      return
    }

    newJournal[block.pauseIndex] = {
      ...newJournal[block.pauseIndex],
      at: newPausedAt,
    }

    newJournal[block.resumeIndex] = {
      ...newJournal[block.resumeIndex],
      at: newResumedAt,
    }

    await syncStoreAndElectron(
      newJournal,
      newStartDate,
      (activeEntry.timeStatus as 'running' | 'paused' | 'finished') || 'paused',
    )
    setEditingIndex(null)
    setInlineError(null)
  }

  const startInlineEditAdj = (
    block: TimelineBlock & { type: 'adjustment' },
  ) => {
    setInlineError(null)
    setInlineAdjType(block.entry.secondsAtEvent > 0 ? 'add' : 'subtract')
    setInlineAdjMinutes(
      String(Math.floor(Math.abs(block.entry.secondsAtEvent) / 60)),
    )
    setInlineAdjNote(block.entry.note || '')
    setEditingIndex(block.index)
  }

  const handleInlineEditAdjSave = async (
    block: TimelineBlock & { type: 'adjustment' },
  ) => {
    if (!activeEntry) return

    const newJournal = [...(activeEntry.journal || [])]
    const currentStartDate = parseISO(activeEntry.startDate!)

    const oldSeconds = block.entry.secondsAtEvent
    const newMinutes = Number(inlineAdjMinutes)
    if (isNaN(newMinutes) || newMinutes <= 0) {
      setInlineError('Insira um tempo válido.')
      return
    }

    const newSeconds = (inlineAdjType === 'add' ? 1 : -1) * newMinutes * 60
    const delta = newSeconds - oldSeconds

    const newStartDate = subSeconds(currentStartDate, delta).toISOString()

    if (isAfter(parseISO(newStartDate), new Date())) {
      const totalRecorded = differenceInSeconds(new Date(), currentStartDate)
      setInlineError(
        `Este ajuste remove ${formatDuration(Math.abs(delta))} adicionais, mas o tempo atual registrado é de apenas ${formatDuration(totalRecorded)}.`,
      )
      return
    }

    newJournal[block.index] = {
      ...newJournal[block.index],
      secondsAtEvent: newSeconds,
      note: inlineAdjNote,
    }

    await syncStoreAndElectron(
      newJournal,
      newStartDate,
      (activeEntry.timeStatus as 'running' | 'paused' | 'finished') || 'paused',
    )
    setEditingIndex(null)
    setInlineError(null)
  }

  const handleAddSave = async () => {
    if (!addMinutes || isNaN(Number(addMinutes)) || !activeEntry) return

    const minutes = Number(addMinutes)
    const secondsDelta = minutes * 60
    const newJournal = [...(activeEntry.journal || [])]
    const currentStartDate = parseISO(activeEntry.startDate!)
    let newStartDate = currentStartDate.toISOString()

    if (addType === 'add') {
      newStartDate = subSeconds(currentStartDate, secondsDelta).toISOString()
    } else {
      newStartDate = addSeconds(currentStartDate, secondsDelta).toISOString()
    }

    if (isAfter(parseISO(newStartDate), new Date())) {
      const totalRecorded = differenceInSeconds(new Date(), currentStartDate)
      setAddError(
        `Você tentou remover ${formatDuration(secondsDelta)}, mas o tempo total registrado é de apenas ${formatDuration(totalRecorded)}.`,
      )
      return
    }

    newJournal.push({
      event: 'adjusted',
      at: new Date().toISOString(),
      secondsAtEvent: addType === 'add' ? secondsDelta : -secondsDelta,
      note:
        addNote || (addType === 'add' ? 'Tempo adicionado' : 'Tempo removido'),
    })

    await syncStoreAndElectron(
      newJournal,
      newStartDate,
      (activeEntry.timeStatus as 'running' | 'paused' | 'finished') || 'paused',
    )

    setIsAddingInline(false)
    setAddMinutes('')
    setAddNote('')
    setAddError(null)
  }

  // ---------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ---------------------------------------------------------------------------
  const renderTimelineBlock = (block: TimelineBlock) => {
    switch (block.type) {
      case 'start':
        return (
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
              <Play className="text-primary h-3 w-3 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-xs font-medium">
                Tarefa Iniciada
              </span>
              <span className="text-muted-foreground text-[10px]">
                {format(parseISO(block.entry.at), 'HH:mm:ss')}
              </span>
            </div>
          </div>
        )

      case 'stop':
        return (
          <div className="flex items-start gap-3">
            <div className="bg-destructive/20 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
              <div className="bg-destructive h-2 w-2 rounded-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-xs font-medium">
                Timer Parado
              </span>
              <span className="text-muted-foreground text-[10px]">
                {format(parseISO(block.entry.at), 'HH:mm:ss')}
              </span>
            </div>
          </div>
        )

      case 'adjustment': {
        const isEditingAdj = editingIndex === block.index

        if (isEditingAdj) {
          return (
            <div className="bg-muted/40 border-border/50 relative z-10 flex flex-col gap-2 rounded-md border p-2 shadow-sm">
              <span className="text-foreground text-xs font-medium">
                Editar Ajuste
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-7 w-7 shrink-0 transition-colors',
                    inlineAdjType === 'add'
                      ? 'border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600'
                      : 'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive',
                  )}
                  onClick={() => {
                    setInlineAdjType((t) => (t === 'add' ? 'subtract' : 'add'))
                    setInlineError(null)
                  }}
                >
                  {inlineAdjType === 'add' ? (
                    <Plus className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Input
                  type="number"
                  min="1"
                  placeholder="Minutos"
                  value={inlineAdjMinutes}
                  onChange={(e) => {
                    setInlineAdjMinutes(e.target.value)
                    setInlineError(null)
                  }}
                  className={cn(
                    'h-7 w-20 px-2 text-xs',
                    inlineError &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
              <Input
                placeholder="Motivo (opcional)"
                value={inlineAdjNote}
                onChange={(e) => setInlineAdjNote(e.target.value)}
                className="h-7 px-2 text-xs"
              />
              {inlineError && (
                <p className="text-destructive mt-1 text-xs leading-snug font-medium">
                  {inlineError}
                </p>
              )}
              <div className="mt-1 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setEditingIndex(null)}
                >
                  <X className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={!inlineAdjMinutes || Number(inlineAdjMinutes) <= 0}
                  onClick={() => handleInlineEditAdjSave(block)}
                >
                  <Check className="text-primary h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        }

        const isPositive = block.entry.secondsAtEvent > 0
        const canDelete = isDeleteSafe(block)

        return (
          <div
            onDoubleClick={() => startInlineEditAdj(block)}
            className="group hover:bg-muted/40 flex cursor-pointer items-start justify-between gap-3 rounded-md p-1 pr-2 transition-colors select-none"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  isPositive
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-destructive/20 text-destructive',
                )}
              >
                {isPositive ? (
                  <Plus className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-medium">
                  {isPositive ? 'Tempo Adicionado' : 'Tempo Removido'}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {formatDuration(Math.abs(block.entry.secondsAtEvent))} •{' '}
                  {block.entry.note || 'Sem descrição'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  startInlineEditAdj(block)
                }}
                className="h-6 w-6 shrink-0"
                title="Editar ajuste"
              >
                <Pencil className="text-muted-foreground h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-disabled={!canDelete}
                onClick={(e) => {
                  e.stopPropagation()
                  if (canDelete) handleDelete(block)
                }}
                className={cn(
                  'h-6 w-6 shrink-0',
                  canDelete
                    ? 'hover:text-destructive'
                    : 'cursor-not-allowed opacity-50',
                )}
                title={
                  canDelete
                    ? 'Excluir ajuste'
                    : 'A exclusão deixaria o tempo negativo'
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      }

      case 'pause-ongoing':
        return (
          <div className="group hover:bg-muted/40 flex items-start justify-between gap-3 rounded-md p-1 pr-2 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-muted-foreground/20 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <Pause className="text-muted-foreground h-3 w-3 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-medium">
                  Pausado (Em andamento)
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Desde {format(parseISO(block.paused.at), 'HH:mm:ss')}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(block)}
              className="hover:text-destructive h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              title="Retomar e excluir pausa"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )

      case 'pause-block': {
        const isEditingPause = editingIndex === block.pauseIndex

        if (isEditingPause) {
          return (
            <div className="bg-muted/40 border-border/50 relative z-10 flex flex-col gap-2 rounded-md border p-2 shadow-sm">
              <span className="text-foreground text-xs font-medium">
                Editar Pausa
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={inlineStartTime}
                  onChange={(e) => {
                    setInlineStartTime(e.target.value)
                    setInlineError(null)
                  }}
                  className={cn(
                    'h-7 w-[85px] px-2 text-xs',
                    inlineError &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
                <span className="text-muted-foreground text-xs">até</span>
                <Input
                  type="time"
                  value={inlineEndTime}
                  onChange={(e) => {
                    setInlineEndTime(e.target.value)
                    setInlineError(null)
                  }}
                  className={cn(
                    'h-7 w-[85px] px-2 text-xs',
                    inlineError &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
              {inlineError && (
                <p className="text-destructive mt-1 text-xs leading-snug font-medium">
                  {inlineError}
                </p>
              )}
              <div className="mt-1 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setEditingIndex(null)}
                >
                  <X className="text-muted-foreground h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleInlineEditPauseSave(block)}
                >
                  <Check className="text-primary h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        }

        const canDelete = isDeleteSafe(block)

        return (
          <div
            onDoubleClick={() => startInlineEditPause(block)}
            className="group hover:bg-muted/40 flex cursor-pointer items-start justify-between gap-3 rounded-md p-1 pr-2 transition-colors select-none"
          >
            <div className="flex items-start gap-3">
              <div className="bg-muted-foreground/20 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <Clock className="text-muted-foreground h-3 w-3" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-xs font-medium">
                  Pausa de {formatDuration(block.durationSeconds)}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {format(parseISO(block.paused.at), 'HH:mm')} -{' '}
                  {format(parseISO(block.resumed.at), 'HH:mm')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  startInlineEditPause(block)
                }}
                className="h-6 w-6 shrink-0"
                title="Editar pausa"
              >
                <Pencil className="text-muted-foreground h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-disabled={!canDelete}
                onClick={(e) => {
                  e.stopPropagation()
                  if (canDelete) handleDelete(block)
                }}
                className={cn(
                  'h-6 w-6 shrink-0',
                  canDelete
                    ? 'hover:text-destructive'
                    : 'cursor-not-allowed opacity-50',
                )}
                title={
                  canDelete
                    ? 'Excluir pausa'
                    : 'A exclusão deixaria o tempo negativo'
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!activeEntry}
          className={cn(
            'text-muted-foreground hover:bg-muted/50 hover:text-foreground h-[18px] w-[18px] rounded p-0 transition-colors',
            !activeEntry && 'cursor-not-allowed opacity-50',
          )}
        >
          <History className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        onInteractOutside={(e) => {
          if (isAddingInline || editingIndex !== null) {
            e.preventDefault()
          }
        }}
        className="bg-card w-[340px] overflow-hidden rounded-lg p-0 shadow-lg"
      >
        <div className="flex items-center justify-between p-3">
          <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Database className="text-primary h-3.5 w-3.5" />
            Histórico da Sessão
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            Hoje <Calendar className="h-3.5 w-3.5" />
          </div>
        </div>

        <Separator />

        <div className="flex max-h-[300px] flex-col overflow-y-auto p-2">
          {!activeEntry || timeline.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-xs">
              Nenhum histórico para esta sessão ainda.
            </div>
          ) : (
            <div className="relative pl-1">
              <div className="bg-border absolute top-2 bottom-2 left-3.5 w-[2px]" />
              <div className="relative flex flex-col gap-4">
                {timeline.map((block, i) => (
                  <React.Fragment key={i}>
                    {renderTimelineBlock(block)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAddingInline && (
          <div className="bg-muted/40 border-border/50 mx-2 mb-2 flex flex-col gap-2 rounded-md border p-2 shadow-sm">
            <span className="text-foreground text-xs font-medium">
              Novo Ajuste
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-7 w-7 shrink-0 transition-colors',
                  addType === 'add'
                    ? 'border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600'
                    : 'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive',
                )}
                onClick={() => {
                  setAddType((t) => (t === 'add' ? 'subtract' : 'add'))
                  setAddError(null)
                }}
              >
                {addType === 'add' ? (
                  <Plus className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
              </Button>
              <Input
                type="number"
                min="1"
                placeholder="Minutos"
                value={addMinutes}
                onChange={(e) => {
                  setAddMinutes(e.target.value)
                  setAddError(null)
                }}
                className={cn(
                  'h-7 text-xs',
                  addError &&
                    'border-destructive focus-visible:ring-destructive',
                )}
              />
            </div>
            <Input
              placeholder="Motivo (opcional)"
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              className="h-7 text-xs"
            />
            {addError && (
              <p className="text-destructive mt-1 text-xs leading-snug font-medium">
                {addError}
              </p>
            )}
            <div className="mt-1 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsAddingInline(false)}
              >
                <X className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={!addMinutes || Number(addMinutes) <= 0}
                onClick={handleAddSave}
              >
                <Check className="text-primary h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {!isAddingInline && <Separator />}

        <div className="bg-muted/10 flex items-center justify-between p-2 px-3">
          <span className="text-muted-foreground text-[10px] font-medium">
            {timeline.length} {timeline.length === 1 ? 'bloco' : 'blocos'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingIndex(null)
              setAddError(null)
              setIsAddingInline(true)
            }}
            className="h-6 gap-1 px-2 text-[10px]"
          >
            <Plus className="h-3 w-3" />
            Ajuste
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
})

TimerHistory.displayName = 'TimerHistory'

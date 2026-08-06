'use client'

import {
  Code2Icon,
  Coffee,
  FlaskConical,
  Minus,
  Pause,
  PenTool,
  Play,
  Square,
  Users,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { LookupInput } from '@/components/lookup-input'
import { TimerDisplay } from '@/components/time-bar/timer-display'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSyncStore } from '@/stores/syncStore'
import { useTimeEntryStore } from '@/stores/timeEntryStore'

import { TimerHistory } from './details/timer-history'
import { TimerSettings } from './details/timer-settings'

const mockActivities: Array<{
  id: string
  name: string
  icon: React.ElementType
}> = [
  { id: 'dev', name: 'Desenvolvimento', icon: Code2Icon },
  { id: 'teste', name: 'Teste', icon: FlaskConical },
  { id: 'design', name: 'Design', icon: PenTool },
  { id: 'meeting', name: 'Meeting', icon: Users },
  { id: 'break', name: 'Break', icon: Coffee },
]

export const UltimateTimeTracker = () => {
  const [taskId, setTaskId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [selectedActivity, setSelectedActivity] = useState<string>('dev')
  const [timerDirection, setTimerDirection] = useState<'up' | 'down'>('up')
  const [widgetLayout, setWidgetLayout] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  )
  const [manualInitialSeconds, setManualInitialSeconds] = useState<number>(0)

  const db = useSyncStore((s) => s.db)

  // Extraímos seletores granulares
  const activeEntry = useTimeEntryStore((s) => s.active)

  console.log('activeEntry', activeEntry)
  const playCurrentTimeEntry = useTimeEntryStore((s) => s.playCurrentTimeEntry)
  const pauseCurrentTimeEntry = useTimeEntryStore(
    (s) => s.pauseCurrentTimeEntry,
  )
  const stopCurrentTimeEntry = useTimeEntryStore((s) => s.stopCurrentTimeEntry)
  const createNewTimeEntry = useTimeEntryStore((s) => s.createNewTimeEntry)

  // 🚀 SINCRONIZAÇÃO AUTOMÁTICA DA UI
  // Quando o app carrega/recupera uma tarefa ou o usuário troca de workspace,
  // este useEffect atualiza os campos de texto e selects locais com os dados do RxDB.
  useEffect(() => {
    if (activeEntry) {
      if (activeEntry.task?.id) setTaskId(activeEntry.task.id)
      if (activeEntry.comments !== undefined)
        setDescription(activeEntry.comments)
      if (activeEntry.activity?.id) setSelectedActivity(activeEntry.activity.id)
      if (activeEntry.timerConfig?.mode) {
        setTimerDirection(
          activeEntry.timerConfig.mode === 'countup' ? 'up' : 'down',
        )
      }
    }
  }, [activeEntry])

  const isRunning = activeEntry?.timeStatus === 'running'
  const isIdle = !activeEntry

  const selectedAct =
    mockActivities.find((a) => a.id === selectedActivity) || mockActivities[0]
  const ActivityIcon = selectedAct.icon

  const handleStart = useCallback(async () => {
    if (!db) return

    if (activeEntry && activeEntry.timeStatus === 'paused') {
      await playCurrentTimeEntry(db)
      return
    }

    const mode = timerDirection === 'up' ? 'countup' : 'countdown'

    await createNewTimeEntry(db, {
      taskId,
      activityId: selectedActivity,
      dataSourceId: 'default',
      type: timerDirection === 'up' ? 'increasing' : 'decreasing',
      connectionInstanceId: 'default-conn',
      comments: description,
      mode,
      manualInitialSeconds,
    })
  }, [
    db,
    activeEntry,
    timerDirection,
    taskId,
    selectedActivity,
    description,
    manualInitialSeconds,
    playCurrentTimeEntry,
    createNewTimeEntry,
  ])

  const handlePause = useCallback(async () => {
    if (!db) return
    await pauseCurrentTimeEntry(db)
  }, [db, pauseCurrentTimeEntry])

  const handleStop = useCallback(async () => {
    if (!db) return
    await stopCurrentTimeEntry(db)
    setManualInitialSeconds(0)
    // Limpa os campos quando o usuário encerra o timer
    setTaskId('')
    setDescription('')
  }, [db, stopCurrentTimeEntry])

  return (
    <Card className="w-full">
      <CardContent className="flex items-center gap-4 px-3 py-2.5">
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex h-10 w-32 flex-col justify-between gap-[4px]">
            <LookupInput
              value={taskId}
              onChange={setTaskId}
              onOpenLookup={() => {}}
              size="micro"
              placeholder="Task ID"
            />

            <Select
              value={selectedActivity}
              onValueChange={setSelectedActivity}
            >
              <SelectTrigger
                className={cn(
                  'cursor-pointer',
                  '!h-[18px] !min-h-0 w-full !border-none !bg-transparent !shadow-none',
                  '!inline-flex !items-center !justify-start !gap-0.5',
                  '!px-1 !py-0',
                  'text-muted-foreground text-[11px] leading-none',
                  'focus:ring-0 focus:ring-offset-0 focus-visible:ring-0',
                  '*:data-[slot=select-value]:flex',
                  '*:data-[slot=select-value]:items-center',
                  '*:data-[slot=select-value]:gap-0',
                  '*:data-[slot=select-value]:leading-none',
                  '*:data-[slot=select-value]:min-w-0',
                  '*:data-[slot=select-value]:w-full',
                  '[&>svg]:!size-2.5',
                  '[&>svg]:shrink-0',
                  '[&>svg]:opacity-50',
                )}
              >
                <SelectValue>
                  <span className="flex w-full min-w-0 items-center gap-2 pr-1">
                    <ActivityIcon className="text-primary h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{selectedAct.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>

              <SelectContent align="start" className="rounded-lg">
                {mockActivities.map(({ id, name, icon: Icon }) => (
                  <SelectItem key={id} value={id} className="h-8 text-[11px]">
                    <span className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5',
                          id === selectedActivity
                            ? 'text-primary'
                            : 'text-muted-foreground',
                        )}
                      />
                      {name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 flex-col justify-between py-[1px]">
              <TimerDisplay
                editable
                mode={timerDirection === 'up' ? 'countup' : 'countdown'}
                onInitialSecondsChange={setManualInitialSeconds}
              />

              <div className="flex items-center gap-1 leading-none">
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Hoje:
                </span>
                <span className="text-muted-foreground font-mono text-[11px] tracking-tight tabular-nums">
                  06h 30m
                </span>
              </div>
            </div>

            {isIdle ? (
              <Button
                variant="default"
                className="h-10 w-10 shrink-0 rounded-xl p-0 transition-transform active:scale-95"
                onClick={handleStart}
              >
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  className="h-10 w-10 shrink-0 rounded-xl p-0 transition-transform active:scale-95"
                  onClick={isRunning ? handlePause : handleStart}
                >
                  {isRunning ? (
                    <Pause className="text-primary h-4 w-4 fill-current" />
                  ) : (
                    <Play className="text-primary ml-0.5 h-4 w-4 fill-current" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="h-10 w-10 shrink-0 rounded-xl p-0 transition-transform active:scale-95"
                  onClick={handleStop}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex h-10 flex-col items-center justify-between py-[1px]">
            <TimerHistory />
            <TimerSettings
              timerDirection={timerDirection}
              setTimerDirection={setTimerDirection}
              widgetLayout={widgetLayout}
              setWidgetLayout={setWidgetLayout}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 pl-1">
          <div className="hover:bg-muted/40 focus-within:bg-muted/40 flex h-10 items-center gap-1.5 rounded-md bg-transparent px-2 transition-colors">
            <Minus className="text-muted-foreground/40 h-4 w-4 shrink-0" />
            <Input
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
              placeholder="What are you working on?"
              className="text-foreground h-full border-none bg-transparent px-1 text-[13px] shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

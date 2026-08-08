// components/time-bar/ultimate-entry-bar.tsx
'use client'

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview'
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Code2Icon,
  Coffee,
  FlaskConical,
  GripHorizontal,
  GripVertical,
  Maximize2,
  MessageSquareDiff,
  Minimize2,
  Minus,
  Pause,
  PenTool,
  Play,
  Square,
  Users,
  X,
} from 'lucide-react'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { LookupInput } from '@/components/lookup-input'
import { TimerDisplay } from '@/components/time-bar/timer-display'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useTimerSettings } from '@/hooks/use-timer-settings'
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

type SortableBlockId =
  | 'task'
  | 'timer'
  | 'today'
  | 'actions'
  | 'tools'
  | 'details'
const DEFAULT_ORDER: SortableBlockId[] = [
  'task',
  'timer',
  'today',
  'actions',
  'tools',
  'details',
]
const STORAGE_KEY = 'metric:widget:block-order'
const FREE_DRAG_STORAGE_KEY = 'metric:widget:free-offset'

type WidgetPosition = 'top' | 'bottom' | 'left' | 'right'
type FreeOffset = { x: number; y: number }
type FreeOffsets = Record<WidgetPosition, FreeOffset>

const DEFAULT_FREE_OFFSETS: FreeOffsets = {
  top: { x: 0, y: 0 },
  bottom: { x: 0, y: 0 },
  left: { x: 0, y: 0 },
  right: { x: 0, y: 0 },
}

function loadFreeOffsets(): FreeOffsets {
  if (typeof window === 'undefined') return DEFAULT_FREE_OFFSETS
  try {
    const raw = window.localStorage.getItem(FREE_DRAG_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === 'object') {
      return { ...DEFAULT_FREE_OFFSETS, ...parsed }
    }
  } catch {}
  return DEFAULT_FREE_OFFSETS
}

function loadOrder(): SortableBlockId[] {
  if (typeof window === 'undefined') return DEFAULT_ORDER
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length === DEFAULT_ORDER.length) {
      const hasAll = DEFAULT_ORDER.every((item) => parsed.includes(item))
      if (hasAll) return parsed as SortableBlockId[]
    }
  } catch {}
  return DEFAULT_ORDER
}

function DragHandle({ isVertical, listeners, attributes }: any) {
  return (
    <div
      {...listeners}
      {...attributes}
      className={cn(
        'group/handle hover:text-primary flex cursor-grab items-center justify-center transition-colors active:cursor-grabbing',
        isVertical ? 'w-full py-1.5' : 'h-full px-1',
      )}
    >
      <div
        className={cn(
          'bg-border/80 group-hover/handle:bg-primary rounded-full transition-colors',
          isVertical ? 'h-[2px] w-5' : 'h-5 w-[2px]',
        )}
      />
    </div>
  )
}

function SortableItem({
  id,
  isVertical,
  children,
}: {
  id: string
  isVertical: boolean
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/block relative flex shrink-0 items-center justify-center select-none',
        isVertical ? 'w-full flex-col gap-0.5' : 'h-full flex-row gap-1',
      )}
    >
      <DragHandle
        listeners={listeners}
        attributes={attributes}
        isVertical={isVertical}
      />
      {children}
    </div>
  )
}

// Clamp seguro matemático (impede min > max)
const clamp = (val: number, min: number, max: number) => {
  const actualMin = Math.min(min, max)
  const actualMax = Math.max(min, max)
  return Math.max(actualMin, Math.min(actualMax, val))
}

export const UltimateTimeTracker = () => {
  const [taskId, setTaskId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [selectedActivity, setSelectedActivity] = useState<string>('dev')
  const [manualInitialSeconds, setManualInitialSeconds] = useState<number>(0)

  const [isEditingVertical, setIsEditingVertical] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const [blocksOrder, setBlocksOrder] =
    useState<SortableBlockId[]>(DEFAULT_ORDER)
  const [freeOffsets, setFreeOffsets] =
    useState<FreeOffsets>(DEFAULT_FREE_OFFSETS)

  const { timerDirection, setTimerDirection, widgetPosition } =
    useTimerSettings()
  const db = useSyncStore((s) => s.db)

  const activeEntry = useTimeEntryStore((s) => s.active)
  const playCurrentTimeEntry = useTimeEntryStore((s) => s.playCurrentTimeEntry)
  const pauseCurrentTimeEntry = useTimeEntryStore(
    (s) => s.pauseCurrentTimeEntry,
  )
  const stopCurrentTimeEntry = useTimeEntryStore((s) => s.stopCurrentTimeEntry)
  const createNewTimeEntry = useTimeEntryStore((s) => s.createNewTimeEntry)

  useEffect(() => {
    setBlocksOrder(loadOrder())
    setFreeOffsets(loadFreeOffsets())
  }, [])

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
  }, [activeEntry, setTimerDirection])

  const isRunning = activeEntry?.timeStatus === 'running'
  const isIdle = !activeEntry
  const isVertical = widgetPosition === 'left' || widgetPosition === 'right'

  const visibleBlocks = useMemo(() => {
    return blocksOrder.filter((id) => {
      // 'task' some na vertical (pois vai pro Popover)
      if (isVertical && id === 'task') return false
      // 'details' some na horizontal (pois a Input é embutida na barra)
      if (!isVertical && id === 'details') return false
      return true
    })
  }, [blocksOrder, isVertical])

  const selectedAct =
    mockActivities.find((a) => a.id === selectedActivity) || mockActivities[0]
  const ActivityIcon = selectedAct.icon

  // --- DND-KIT para Subgrupos ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setBlocksOrder((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder))
        }
        return newOrder
      })
    }
  }

  // --- ARRASTE GLOBAL DA BARRA (100% DOM Manipulado) ---
  const cardRef = useRef<HTMLDivElement | null>(null)
  const widgetHandleRef = useRef<HTMLDivElement | null>(null)

  const currentOffsetRef = useRef<FreeOffset>({ x: 0, y: 0 })
  const freeOffsetsRef = useRef<FreeOffsets>(DEFAULT_FREE_OFFSETS)
  const isDraggingWidgetRef = useRef(false)

  const dragStateRef = useRef<{
    initialRect: DOMRect
    parentRect: DOMRect
    animationFrameId: number | null
  } | null>(null)

  useEffect(() => {
    freeOffsetsRef.current = freeOffsets
    currentOffsetRef.current = freeOffsets[
      widgetPosition as WidgetPosition
    ] ?? { x: 0, y: 0 }
  }, [freeOffsets, widgetPosition])

  // Aplica o transform com a posição validada sem acionar a re-renderização durante o arraste
  useLayoutEffect(() => {
    const element = cardRef.current
    if (!element || isDraggingWidgetRef.current) return

    const offset = freeOffsets[widgetPosition as WidgetPosition] ?? {
      x: 0,
      y: 0,
    }
    const newX = isVertical ? 0 : offset.x
    const newY = isVertical ? offset.y : 0

    element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`
  }, [freeOffsets, widgetPosition, isVertical])

  useEffect(() => {
    const element = cardRef.current
    const dragHandle = widgetHandleRef.current
    if (!element || !dragHandle) return

    const getClampedDelta = (
      initialRect: DOMRect,
      parentRect: DOMRect,
      rawDx: number,
      rawDy: number,
    ) => {
      const padding = 8

      const minDx = parentRect.left - initialRect.left + padding
      const maxDx = parentRect.right - initialRect.right - padding
      const minDy = parentRect.top - initialRect.top + padding
      const maxDy = parentRect.bottom - initialRect.bottom - padding

      return {
        dx: clamp(rawDx, minDx, maxDx),
        dy: clamp(rawDy, minDy, maxDy),
      }
    }

    const scheduleTransform = (offset: FreeOffset) => {
      const dragState = dragStateRef.current
      if (!dragState) return

      if (dragState.animationFrameId !== null) {
        cancelAnimationFrame(dragState.animationFrameId)
      }

      dragState.animationFrameId = requestAnimationFrame(() => {
        element.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`

        if (dragStateRef.current) {
          dragStateRef.current.animationFrameId = null
        }
      })
    }

    const cleanup = combine(
      draggable({
        element,
        dragHandle,
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          disableNativeDragPreview({ nativeSetDragImage })
        },
        onDragStart: () => {
          preventUnhandled.start()

          const initialRect = element.getBoundingClientRect()
          const parent = element.parentElement
          const parentRect = parent
            ? parent.getBoundingClientRect()
            : ({
                left: 0,
                top: 0,
                right: window.innerWidth,
                bottom: window.innerHeight,
              } as DOMRect)

          dragStateRef.current = {
            initialRect,
            parentRect,
            animationFrameId: null,
          }

          isDraggingWidgetRef.current = true
          element.style.transition = 'none'
          element.classList.add('z-30', 'shadow-xl')
        },
        onDrag: ({ location }) => {
          const dragState = dragStateRef.current
          if (!dragState) return

          const rawDx =
            location.current.input.clientX - location.initial.input.clientX
          const rawDy =
            location.current.input.clientY - location.initial.input.clientY

          const { dx, dy } = getClampedDelta(
            dragState.initialRect,
            dragState.parentRect,
            rawDx,
            rawDy,
          )

          const currentOffset = currentOffsetRef.current
          const nextOffset: FreeOffset = isVertical
            ? { x: 0, y: currentOffset.y + dy }
            : { x: currentOffset.x + dx, y: 0 }

          scheduleTransform(nextOffset)
        },
        onDrop: ({ location }) => {
          preventUnhandled.stop()

          const dragState = dragStateRef.current
          if (!dragState) {
            isDraggingWidgetRef.current = false
            return
          }

          if (dragState.animationFrameId !== null) {
            cancelAnimationFrame(dragState.animationFrameId)
          }

          const rawDx =
            location.current.input.clientX - location.initial.input.clientX
          const rawDy =
            location.current.input.clientY - location.initial.input.clientY

          const { dx, dy } = getClampedDelta(
            dragState.initialRect,
            dragState.parentRect,
            rawDx,
            rawDy,
          )

          const previousOffset = currentOffsetRef.current
          const nextOffset: FreeOffset = isVertical
            ? { x: 0, y: previousOffset.y + dy }
            : { x: previousOffset.x + dx, y: 0 }

          const nextOffsets: FreeOffsets = {
            ...freeOffsetsRef.current,
            [widgetPosition as WidgetPosition]: nextOffset,
          }

          currentOffsetRef.current = nextOffset
          freeOffsetsRef.current = nextOffsets

          element.style.transform = `translate3d(${nextOffset.x}px, ${nextOffset.y}px, 0)`
          element.style.transition = ''
          element.classList.remove('z-30', 'shadow-xl')

          dragStateRef.current = null
          isDraggingWidgetRef.current = false

          setFreeOffsets(nextOffsets)

          window.localStorage.setItem(
            FREE_DRAG_STORAGE_KEY,
            JSON.stringify(nextOffsets),
          )
        },
      }),
    )

    return () => {
      if (dragStateRef.current?.animationFrameId !== null) {
        cancelAnimationFrame(dragStateRef.current?.animationFrameId ?? -1)
      }
      dragStateRef.current = null
      isDraggingWidgetRef.current = false
      cleanup()
    }
  }, [isVertical, widgetPosition])

  // --- Recálculo de limites no resize c/ Debounce ---
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    let animationFrameId: number | null = null

    const clampCurrentOffsetToViewport = () => {
      animationFrameId = null

      if (isDraggingWidgetRef.current) return

      const rect = element.getBoundingClientRect()
      const parent = element.parentElement
      if (!parent) return

      const pRect = parent.getBoundingClientRect()
      const current = currentOffsetRef.current

      // Usando math base position pra não forçar synchronous layout calc
      const baseLeft = rect.left - current.x
      const baseTop = rect.top - current.y

      const minX = pRect.left - baseLeft
      const maxX = pRect.right - (baseLeft + rect.width)
      const minY = pRect.top - baseTop
      const maxY = pRect.bottom - (baseTop + rect.height)

      const nextOffset: FreeOffset = {
        x: isVertical ? 0 : clamp(current.x, minX, maxX),
        y: isVertical ? clamp(current.y, minY, maxY) : 0,
      }

      if (nextOffset.x === current.x && nextOffset.y === current.y) {
        return
      }

      const nextOffsets: FreeOffsets = {
        ...freeOffsetsRef.current,
        [widgetPosition as WidgetPosition]: nextOffset,
      }

      currentOffsetRef.current = nextOffset
      freeOffsetsRef.current = nextOffsets

      setFreeOffsets(nextOffsets)

      window.localStorage.setItem(
        FREE_DRAG_STORAGE_KEY,
        JSON.stringify(nextOffsets),
      )
    }

    let timeoutId: ReturnType<typeof setTimeout>
    const scheduleClamp = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (animationFrameId !== null) return
        animationFrameId = requestAnimationFrame(clampCurrentOffsetToViewport)
      }, 150)
    }

    window.addEventListener('resize', scheduleClamp)

    const observer = new ResizeObserver(scheduleClamp)
    observer.observe(element)

    // Avaliação inicial
    scheduleClamp()

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', scheduleClamp)
      observer.disconnect()

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isVertical, widgetPosition])

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
    setTaskId('')
    setDescription('')
    setIsEditingVertical(false)
  }, [db, stopCurrentTimeEntry])

  // --- RENDERS DE BLOCOS INDIVIDUAIS ---

  const renderTaskBlock = () => (
    <div className="flex h-10 w-32 shrink-0 flex-col justify-between gap-[4px]">
      <LookupInput
        value={taskId}
        onChange={setTaskId}
        onOpenLookup={() => {}}
        size="micro"
        placeholder="Task ID"
      />
      <Select value={selectedActivity} onValueChange={setSelectedActivity}>
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
  )

  const renderTimerBlock = () => (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        isVertical ? 'flex-col' : '',
      )}
    >
      <div
        className={cn(
          isVertical
            ? 'flex w-full flex-col items-center justify-center text-center opacity-90'
            : 'flex',
        )}
      >
        <TimerDisplay
          orientation={isVertical ? 'vertical' : 'horizontal'}
          editable
          mode={timerDirection === 'up' ? 'countup' : 'countdown'}
          onInitialSecondsChange={setManualInitialSeconds}
        />
      </div>
    </div>
  )

  const renderTodayBlock = () => (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        isVertical ? 'flex-col gap-0.5' : 'gap-1',
      )}
    >
      <span
        className={cn(
          'text-muted-foreground text-[10px] font-bold tracking-wider uppercase',
          isVertical && 'opacity-70',
        )}
      >
        Hoje{isVertical ? '' : ':'}
      </span>
      <span className="text-muted-foreground font-mono text-[11px] tracking-tight tabular-nums">
        00h 00m
      </span>
    </div>
  )

  const renderActionsBlock = () => (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        isVertical ? 'flex-col gap-1.5' : 'gap-1.5',
      )}
    >
      {isIdle ? (
        <Button
          variant="default"
          className="h-10 w-10 shrink-0 rounded-lg p-0 shadow-md transition-transform active:scale-95"
          onClick={handleStart}
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </Button>
      ) : (
        <div
          className={cn('flex items-center gap-1.5', isVertical && 'flex-col')}
        >
          <Button
            variant={isRunning ? 'outline' : 'default'}
            className="h-10 w-10 shrink-0 rounded-lg p-0 shadow-sm transition-transform active:scale-95"
            onClick={isRunning ? handlePause : handleStart}
          >
            {isRunning ? (
              <Pause className="text-primary h-4 w-4 fill-current" />
            ) : (
              <Play
                className={cn(
                  'ml-0.5 h-4 w-4 fill-current',
                  isVertical ? 'text-primary-foreground' : 'text-primary',
                )}
              />
            )}
          </Button>
          <Button
            variant="destructive"
            className={cn(
              'shrink-0 transition-transform active:scale-95',
              isVertical
                ? 'h-7 w-7 rounded-lg p-0 opacity-90 hover:opacity-100'
                : 'h-10 w-10 rounded-lg p-0',
            )}
            onClick={handleStop}
          >
            <Square
              className={cn(
                'fill-current',
                isVertical ? 'h-3 w-3' : 'h-3.5 w-3.5',
              )}
            />
          </Button>
        </div>
      )}
    </div>
  )

  const renderToolsBlock = () => (
    <div
      className={cn(
        'flex shrink-0 items-center',
        isVertical ? 'flex-col gap-2.5' : 'gap-2.5',
      )}
    >
      {isVertical && <Separator className="w-8 opacity-50" />}

      <div
        role="group"
        aria-label="Configurações do timer"
        className={cn(
          'bg-muted/40 flex items-center gap-1 rounded-lg p-1',
          isVertical ? 'flex-col' : 'flex-row',
        )}
      >
        <TimerHistory />
        <TimerSettings />
      </div>
    </div>
  )

  const renderDetailsBlock = () => {
    if (!isVertical) return null
    return (
      <div className="flex shrink-0 items-center justify-center">
        <Popover open={isEditingVertical} onOpenChange={setIsEditingVertical}>
          <PopoverTrigger asChild>
            <Button
              variant={isEditingVertical ? 'secondary' : 'ghost'}
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0 rounded-full transition-colors"
              title="Adicionar comentário / detalhes da tarefa"
            >
              {isEditingVertical ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <MessageSquareDiff className="h-3.5 w-3.5" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side={widgetPosition === 'left' ? 'right' : 'left'}
            sideOffset={16}
            className="border-border/50 bg-card flex w-[240px] flex-col gap-2.5 rounded-lg border p-2.5 shadow-lg"
          >
            <div className="mb-0.5 flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Detalhes da Tarefa
              </span>
              <ActivityIcon className="text-primary h-3.5 w-3.5 opacity-80" />
            </div>

            <LookupInput
              value={taskId}
              onChange={setTaskId}
              onOpenLookup={() => {}}
              size="sm"
              placeholder="Vincular Task ID"
              className="w-full"
            />

            <Select
              value={selectedActivity}
              onValueChange={setSelectedActivity}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockActivities.map(({ id, name, icon: Icon }) => (
                  <SelectItem key={id} value={id} className="text-xs">
                    <span className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-3 w-3',
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

            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="No que está trabalhando?"
              className="h-8 text-xs focus-visible:ring-1"
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  const renderContentForId = (id: SortableBlockId) => {
    switch (id) {
      case 'task':
        return renderTaskBlock()
      case 'timer':
        return renderTimerBlock()
      case 'today':
        return renderTodayBlock()
      case 'actions':
        return renderActionsBlock()
      case 'tools':
        return renderToolsBlock()
      case 'details':
        return renderDetailsBlock()
      default:
        return null
    }
  }

  return (
    <Card
      ref={cardRef}
      data-orientation={isVertical ? 'vertical' : 'horizontal'}
      className={cn(
        'group border-border/60 bg-card relative inline-flex w-fit items-center rounded-lg border px-1 py-1 shadow-md transition-transform duration-150 ease-out',
        isVertical && 'h-fit w-16 flex-col items-center gap-1 px-1 py-2',
      )}
    >
      <CardContent
        className={cn(
          'flex w-full p-0 transition-all',
          isVertical
            ? 'h-full min-h-0 flex-col items-center justify-start gap-3 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'flex-row items-center gap-2',
        )}
      >
        <div
          ref={widgetHandleRef}
          className={cn(
            'text-muted-foreground/30 hover:text-muted-foreground global-drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center transition-colors active:cursor-grabbing',
            isVertical ? 'w-full py-3' : 'h-full px-3',
          )}
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          title={
            isVertical
              ? 'Arraste para mover para cima/baixo'
              : 'Arraste para mover para esquerda/direita'
          }
        >
          {isVertical ? (
            <GripHorizontal className="h-4 w-4" />
          ) : (
            <GripVertical className="h-4 w-4" />
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[
            restrictToParentElement,
            isVertical ? restrictToVerticalAxis : restrictToHorizontalAxis,
          ]}
        >
          <SortableContext
            items={visibleBlocks}
            strategy={
              isVertical
                ? verticalListSortingStrategy
                : horizontalListSortingStrategy
            }
          >
            {visibleBlocks.map((id) => (
              <SortableItem key={id} id={id} isVertical={isVertical}>
                {renderContentForId(id)}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {!isVertical && (
          <>
            {!isMinimized && (
              <div className="w-48 shrink-0 pl-1">
                <div className="hover:bg-muted/40 focus-within:bg-muted/40 flex h-10 items-center gap-1.5 rounded-lg bg-transparent px-2 transition-colors">
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
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-muted-foreground hover:text-foreground h-8 w-8 shrink-0 transition-transform',
                !isMinimized && 'ml-auto',
              )}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2Icon,
  Coffee,
  FlaskConical,
  GripHorizontal,
  GripVertical,
  MessageSquareDiff,
  Pause,
  PenTool,
  Play,
  Square,
  Users,
  X,
} from 'lucide-react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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

const getDragBoundaryElement = (element: HTMLElement): HTMLElement | null =>
  element.closest<HTMLElement>('[data-widget-drag-boundary]') ??
  element.parentElement

const clamp = (val: number, min: number, max: number) => {
  const actualMin = Math.min(min, max)
  const actualMax = Math.max(min, max)
  return Math.max(actualMin, Math.min(actualMax, val))
}

// ---------------------------------------------------------------------------
// 1. CONTEXT API
// ---------------------------------------------------------------------------
type UltimateTimeTrackerContextType = {
  isVertical: boolean
  widgetPosition: WidgetPosition
  isExpanded: boolean
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
  widgetHandleRef: React.RefObject<HTMLDivElement | null>

  taskId: string
  setTaskId: React.Dispatch<React.SetStateAction<string>>
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
  selectedActivity: string
  setSelectedActivity: React.Dispatch<React.SetStateAction<string>>
  manualInitialSeconds: number
  setManualInitialSeconds: React.Dispatch<React.SetStateAction<number>>

  isEditingVertical: boolean
  setIsEditingVertical: React.Dispatch<React.SetStateAction<boolean>>
  timerDirection: 'up' | 'down'
  isRunning: boolean
  isIdle: boolean

  handleStart: () => void
  handlePause: () => void
  handleStop: () => void

  onWidgetEnter: () => void
  onWidgetLeave: () => void
}

const UltimateTimeTrackerContext =
  createContext<UltimateTimeTrackerContextType | null>(null)

export const useTrackerContext = () => {
  const context = useContext(UltimateTimeTrackerContext)
  if (!context) {
    throw new Error(
      'UltimateTimeTracker compound components must be used within <UltimateTimeTracker>',
    )
  }
  return context
}

// ---------------------------------------------------------------------------
// 2. ROOT COMPONENT
// ---------------------------------------------------------------------------
export const UltimateTimeTracker = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [taskId, setTaskId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [selectedActivity, setSelectedActivity] = useState<string>('dev')
  const [manualInitialSeconds, setManualInitialSeconds] = useState<number>(0)

  const [isEditingVertical, setIsEditingVertical] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const cardRef = useRef<HTMLDivElement | null>(null)
  const widgetHandleRef = useRef<HTMLDivElement | null>(null)

  const currentOffsetRef = useRef<FreeOffset>({ x: 0, y: 0 })
  const freeOffsetsRef = useRef<FreeOffsets>(DEFAULT_FREE_OFFSETS)
  const isDraggingWidgetRef = useRef(false)

  // -- INÍCIO DA LÓGICA DE BLINDAGEM DE HOVER / IPC --
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onWidgetEnter = useCallback(() => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    if (typeof window !== 'undefined' && (window as any).electron) {
      ;(window as any).electron.ipcRenderer
        .invoke('WIDGET_SET_IGNORE_MOUSE', { body: { ignore: false } })
        .catch(() => {})
    }
  }, [])

  const onWidgetLeave = useCallback(() => {
    if (isDraggingWidgetRef.current) return
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)

    // Pequeno debounce (100ms) para evitar que popovers/tooltips fechem acidentalmente ao transitar o mouse
    leaveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).electron) {
        ;(window as any).electron.ipcRenderer
          .invoke('WIDGET_SET_IGNORE_MOUSE', { body: { ignore: true } })
          .catch(() => {})
      }
    }, 100)
  }, [])
  // -- FIM DA LÓGICA DE BLINDAGEM DE HOVER / IPC --

  const dragStateRef = useRef<{
    initialRect: DOMRect
    parentRect: DOMRect
    initialClientX: number
    initialClientY: number
    animationFrameId: number | null
  } | null>(null)

  useEffect(() => {
    freeOffsetsRef.current = freeOffsets
    currentOffsetRef.current = freeOffsets[
      widgetPosition as WidgetPosition
    ] ?? { x: 0, y: 0 }
  }, [freeOffsets, widgetPosition])

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

    let activePointerId: number | null = null

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const dragState = dragStateRef.current
      if (!dragState) return

      const rawDx = event.clientX - dragState.initialClientX
      const rawDy = event.clientY - dragState.initialClientY

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
    }

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return

      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finishDrag)
      window.removeEventListener('pointercancel', finishDrag)

      if (
        activePointerId !== null &&
        dragHandle.hasPointerCapture(activePointerId)
      ) {
        dragHandle.releasePointerCapture(activePointerId)
      }
      activePointerId = null

      const dragState = dragStateRef.current
      if (!dragState) {
        isDraggingWidgetRef.current = false
        return
      }

      if (dragState.animationFrameId !== null) {
        cancelAnimationFrame(dragState.animationFrameId)
      }

      const rawDx = event.clientX - dragState.initialClientX
      const rawDy = event.clientY - dragState.initialClientY

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

      // Safely ensure we revert back to transparent if mouse left while dropping
      if (!element.matches(':hover')) {
        onWidgetLeave()
      }

      setFreeOffsets(nextOffsets)

      window.localStorage.setItem(
        FREE_DRAG_STORAGE_KEY,
        JSON.stringify(nextOffsets),
      )
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return

      const target = event.target as HTMLElement
      if (
        target.closest(
          'button, input, select, [role="button"], [data-no-drag], a, textarea',
        )
      ) {
        return
      }

      activePointerId = event.pointerId
      dragHandle.setPointerCapture(activePointerId)

      const initialRect = element.getBoundingClientRect()
      const boundary = getDragBoundaryElement(element)
      const parentRect = boundary
        ? boundary.getBoundingClientRect()
        : ({
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
          } as DOMRect)

      dragStateRef.current = {
        initialRect,
        parentRect,
        initialClientX: event.clientX,
        initialClientY: event.clientY,
        animationFrameId: null,
      }

      isDraggingWidgetRef.current = true
      element.style.transition = 'none'
      element.classList.add('z-30', 'shadow-xl')

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', finishDrag)
      window.addEventListener('pointercancel', finishDrag)

      event.preventDefault()
    }

    dragHandle.addEventListener('pointerdown', onPointerDown)

    return () => {
      dragHandle.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finishDrag)
      window.removeEventListener('pointercancel', finishDrag)

      if (dragStateRef.current?.animationFrameId !== null) {
        cancelAnimationFrame(dragStateRef.current?.animationFrameId ?? -1)
      }
      dragStateRef.current = null
      isDraggingWidgetRef.current = false
    }
  }, [isVertical, widgetPosition, onWidgetLeave])

  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    let animationFrameId: number | null = null

    const clampCurrentOffsetToViewport = () => {
      animationFrameId = null

      if (isDraggingWidgetRef.current) return

      const rect = element.getBoundingClientRect()
      const boundary = getDragBoundaryElement(element)
      if (!boundary) return

      const pRect = boundary.getBoundingClientRect()
      const current = currentOffsetRef.current

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

  const content = children || (
    <>
      <UltimateTimeTracker.Handle />
      <UltimateTimeTracker.Blocks>
        <UltimateTimeTracker.Block id="task">
          <UltimateTimeTracker.TaskBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="timer">
          <UltimateTimeTracker.TimerBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="today">
          <UltimateTimeTracker.TodayBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="actions">
          <UltimateTimeTracker.ActionsBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="tools">
          <UltimateTimeTracker.ToolsBlock />
        </UltimateTimeTracker.Block>
      </UltimateTimeTracker.Blocks>
      <UltimateTimeTracker.InlineInput />
      <UltimateTimeTracker.Expander />
    </>
  )

  const contextValue: UltimateTimeTrackerContextType = {
    isVertical,
    widgetPosition,
    isExpanded,
    setIsExpanded,
    widgetHandleRef,
    taskId,
    setTaskId,
    description,
    setDescription,
    selectedActivity,
    setSelectedActivity,
    manualInitialSeconds,
    setManualInitialSeconds,
    isEditingVertical,
    setIsEditingVertical,
    timerDirection,
    isRunning,
    isIdle,
    handleStart,
    handlePause,
    handleStop,
    onWidgetEnter,
    onWidgetLeave,
  }

  return (
    <UltimateTimeTrackerContext.Provider value={contextValue}>
      <Card
        ref={cardRef}
        data-orientation={isVertical ? 'vertical' : 'horizontal'}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseEnter={onWidgetEnter}
        onMouseLeave={onWidgetLeave}
        className={cn(
          'group border-border/60 bg-card pointer-events-auto relative inline-flex w-fit items-center rounded-lg border shadow-md transition-transform duration-150 ease-out select-none',
          isVertical ? 'h-fit w-16 flex-col items-center gap-1 pb-8' : 'pr-8',
        )}
      >
        <CardContent
          className={cn(
            'flex w-full transition-all',
            isVertical
              ? 'h-full min-h-0 flex-col items-center justify-start gap-3 overflow-x-hidden overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              : 'flex-row items-center gap-2 py-1 pl-1',
          )}
        >
          {content}
        </CardContent>
      </Card>
    </UltimateTimeTrackerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// 3. COMPOUND COMPONENTS (Módulos que compõem o Tracker)
// ---------------------------------------------------------------------------

UltimateTimeTracker.Handle = function TrackerHandle() {
  const { isVertical, widgetHandleRef } = useTrackerContext()

  return (
    <div
      ref={widgetHandleRef}
      className={cn(
        'text-muted-foreground/30 hover:text-muted-foreground global-drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center transition-colors select-none active:cursor-grabbing',
        isVertical ? 'w-full py-1.5' : 'h-full px-2',
      )}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      title="Arraste para mover"
    >
      {isVertical ? (
        <GripHorizontal className="h-4 w-4" />
      ) : (
        <GripVertical className="h-4 w-4" />
      )}
    </div>
  )
}

function DragHandle({ isVertical, listeners, attributes }: any) {
  return (
    <div
      {...listeners}
      {...attributes}
      data-no-drag
      className={cn(
        'group/handle hover:text-primary flex cursor-grab items-center justify-center transition-colors active:cursor-grabbing',
        isVertical ? 'w-full py-1' : 'h-full px-0.5',
      )}
    >
      <div
        className={cn(
          'bg-border/80 group-hover/handle:bg-primary rounded-full transition-colors',
          isVertical ? 'h-[2px] w-4' : 'h-4 w-[2px]',
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

interface TrackerBlockProps {
  id: string
  isHidden?: boolean
  children?: React.ReactNode
}

UltimateTimeTracker.Blocks = function TrackerBlocks({
  children,
}: {
  children: React.ReactNode
}) {
  const { isVertical, isExpanded } = useTrackerContext()
  const { hiddenBlocks } = useTimerSettings()

  const childrenArray = React.Children.toArray(children)

  const isTrackerBlock = (
    child: React.ReactNode,
  ): child is React.ReactElement<TrackerBlockProps> => {
    return (
      React.isValidElement<TrackerBlockProps>(child) &&
      child.props !== null &&
      typeof child.props === 'object' &&
      'id' in child.props
    )
  }

  const blockChildren = childrenArray.filter(isTrackerBlock)
  const childIds = blockChildren.map((c) => c.props.id)

  const [blocksOrder, setBlocksOrder] = useState<string[]>(() => {
    let saved: string[] = []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) saved = JSON.parse(raw)
    } catch {}

    const savedValid = saved.filter((id) => childIds.includes(id))
    const missing = childIds.filter((id) => !savedValid.includes(id))
    return [...savedValid, ...missing]
  })

  useEffect(() => {
    setBlocksOrder((prev) => {
      const valid = prev.filter((id) => childIds.includes(id))
      const missing = childIds.filter((id) => !valid.includes(id))
      if (missing.length === 0 && valid.length === prev.length) return prev
      return [...valid, ...missing]
    })
  }, [childIds.join(',')])

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

  const visibleChildIds = blockChildren
    .filter((c) => !c.props.isHidden)
    .map((c) => c.props.id)

  let visibleBlocks = blocksOrder.filter((id) => visibleChildIds.includes(id))
  if (!isExpanded) {
    visibleBlocks = visibleBlocks.filter((id) => !hiddenBlocks.includes(id))
  }

  return (
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
        {visibleBlocks.map((id) => {
          const child = blockChildren.find((c) => c.props.id === id)
          return child || null
        })}
      </SortableContext>
    </DndContext>
  )
}

UltimateTimeTracker.Block = function TrackerBlock({
  id,
  isHidden,
  children,
}: TrackerBlockProps) {
  const { isVertical } = useTrackerContext()
  if (isHidden) return null

  return (
    <SortableItem id={id} isVertical={isVertical}>
      {children}
    </SortableItem>
  )
}

UltimateTimeTracker.Expander = function Expander() {
  const { isVertical, isExpanded, setIsExpanded } = useTrackerContext()
  const { hiddenBlocks } = useTimerSettings()

  if (hiddenBlocks.length === 0) return null

  return (
    <div
      data-no-drag
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground z-10 flex shrink-0 cursor-pointer items-center justify-center transition-all active:scale-95',
        isVertical
          ? 'absolute bottom-0 left-0 h-5 w-full rounded-b-md'
          : 'absolute top-0 right-0 h-full w-5 rounded-r-md',
      )}
      title={isExpanded ? 'Recolher itens' : 'Expandir itens'}
    >
      {isVertical ? (
        isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )
      ) : isExpanded ? (
        <ChevronLeft className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
    </div>
  )
}
UltimateTimeTracker.InlineInput = function TrackerInlineInput() {
  const { isVertical, description, setDescription } = useTrackerContext()

  if (isVertical) return null

  return (
    <div className="w-44 shrink-0 pl-1" data-no-drag>
      <div className="hover:bg-muted/40 focus-within:bg-muted/40 flex h-9 items-center gap-1.5 rounded-lg bg-transparent px-2 transition-colors">
        <Input
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDescription(e.target.value)
          }
          placeholder="O que está fazendo?"
          className="text-foreground h-full border-none bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. BLOCOS DE UI INTERNOS (Consumindo Context)
// ---------------------------------------------------------------------------

UltimateTimeTracker.TaskBlock = function TaskBlock() {
  const {
    isVertical,
    taskId,
    setTaskId,
    selectedActivity,
    setSelectedActivity,
    isEditingVertical,
    setIsEditingVertical,
    description,
    setDescription,
    widgetPosition,
    onWidgetEnter,
    onWidgetLeave,
  } = useTrackerContext()

  const selectedAct =
    mockActivities.find((a) => a.id === selectedActivity) || mockActivities[0]
  const ActivityIcon = selectedAct.icon

  if (isVertical) {
    return (
      <div className="flex shrink-0 items-center justify-center" data-no-drag>
        <Popover open={isEditingVertical} onOpenChange={setIsEditingVertical}>
          <PopoverTrigger asChild>
            <Button
              variant={isEditingVertical ? 'secondary' : 'ghost'}
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0 rounded-full transition-colors"
              title="Detalhes da Tarefa"
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
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            onMouseEnter={onWidgetEnter}
            onMouseLeave={onWidgetLeave}
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
              <SelectContent
                onMouseEnter={onWidgetEnter}
                onMouseLeave={onWidgetLeave}
              >
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

  return (
    <div
      className="flex h-10 w-32 shrink-0 flex-col justify-between gap-[4px]"
      data-no-drag
    >
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
        <SelectContent
          align="start"
          className="rounded-lg"
          onMouseEnter={onWidgetEnter}
          onMouseLeave={onWidgetLeave}
        >
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
}

UltimateTimeTracker.TimerBlock = function TimerBlock() {
  const { isVertical, timerDirection, setManualInitialSeconds } =
    useTrackerContext()

  return (
    <div
      data-no-drag
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
}

UltimateTimeTracker.TodayBlock = function TodayBlock() {
  const { isVertical } = useTrackerContext()
  return (
    <div
      data-no-drag
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
}

UltimateTimeTracker.ActionsBlock = function ActionsBlock() {
  const {
    isVertical,
    isIdle,
    isRunning,
    handleStart,
    handlePause,
    handleStop,
  } = useTrackerContext()

  return (
    <div
      data-no-drag
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
}

UltimateTimeTracker.ToolsBlock = function ToolsBlock() {
  const { isVertical } = useTrackerContext()
  return (
    <div
      data-no-drag
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
}

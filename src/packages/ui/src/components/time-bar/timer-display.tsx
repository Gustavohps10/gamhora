// components/time-bar/timer-display.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useClient } from '@/hooks'
import { cn } from '@/lib/utils'
import { useTimeEntryStore } from '@/stores/timeEntryStore'

import { formatTime, parseTimeInput, TimerMode } from './timer-engine'
import { TimerInput } from './timer-input'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerDisplayProps {
  editable?: boolean
  mode?: TimerMode
  initialValue?: number | string
  onInitialSecondsChange?: (seconds: number) => void
  className?: string
  status?: TimerStatus
  seconds?: number
  orientation?: 'horizontal' | 'vertical'
}

function resolveInitialSeconds(initialValue?: number | string): number {
  if (initialValue === undefined) return 0
  if (typeof initialValue === 'number') return initialValue
  return parseTimeInput(initialValue) ?? 0
}

export function TimerDisplay({
  editable = false,
  mode = 'countup',
  initialValue,
  onInitialSecondsChange,
  className,
  status: statusOverride,
  seconds: secondsOverride,
  orientation = 'horizontal',
}: TimerDisplayProps) {
  const storeStatus = useTimeEntryStore((s) => s.active?.timeStatus) || 'idle'
  const client = useClient()

  const resolvedStatus: TimerStatus = statusOverride ?? storeStatus
  const isRunning = resolvedStatus === 'running'

  const [currentSeconds, setCurrentSeconds] = useState(() =>
    resolveInitialSeconds(initialValue),
  )

  useEffect(() => {
    if (resolvedStatus === 'idle' || resolvedStatus === 'paused') {
      setCurrentSeconds(resolveInitialSeconds(initialValue))
    }
  }, [initialValue, resolvedStatus])

  useEffect(() => {
    if (!isRunning) return

    const unsubscribeTick = client.events.on<{ seconds: number }>(
      'timer:tick',
      (data) => {
        setCurrentSeconds(data.seconds)
      },
    )

    const unsubscribeFinished = client.events.on('timer:finished', () => {
      setCurrentSeconds(0)
    })

    return () => {
      unsubscribeTick()
      unsubscribeFinished()
    }
  }, [isRunning])

  const displaySeconds =
    secondsOverride !== undefined ? secondsOverride : currentSeconds

  const formattedTime = useMemo(
    () => formatTime(displaySeconds),
    [displaySeconds],
  )

  // Desestruturação manual para empilhar no modo vertical
  const h = Math.floor(displaySeconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((displaySeconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = (displaySeconds % 60).toString().padStart(2, '0')

  const isWarning =
    mode === 'countdown' &&
    isRunning &&
    displaySeconds > 0 &&
    displaySeconds < 60

  const handleChange = useCallback(
    (newSeconds: number) => {
      setCurrentSeconds(newSeconds)
      onInitialSecondsChange?.(newSeconds)
    },
    [onInitialSecondsChange],
  )

  const canEdit = editable && resolvedStatus === 'idle'

  return (
    <span
      data-status={resolvedStatus}
      data-mode={mode}
      data-warning={isWarning || undefined}
      data-orientation={orientation}
      className={cn(
        'inline-flex items-center justify-center font-semibold tracking-tight tabular-nums transition-all duration-300',
        orientation === 'vertical'
          ? 'w-full flex-col gap-0.5 font-mono text-[12px] leading-[1.15] whitespace-nowrap'
          : 'font-mono text-[18px] leading-none',
        resolvedStatus === 'idle' && 'text-muted-foreground/40',
        resolvedStatus === 'running' && 'text-primary',
        resolvedStatus === 'paused' &&
          'text-muted-foreground animate-pulse opacity-80',
        resolvedStatus === 'finished' && 'text-destructive',
        isRunning && !isWarning && 'animate-timer-pulse',
        isWarning && [
          'text-destructive',
          'drop-shadow-[0_0_8px_hsl(var(--destructive)/0.6)]',
          'animate-warning-pulse',
        ],
        className,
      )}
    >
      {canEdit ? (
        <TimerInput
          value={displaySeconds}
          onChange={handleChange}
          className={cn(
            'font-semibold tracking-tight',
            orientation === 'vertical'
              ? 'w-10 text-center text-[11px]'
              : 'text-[18px]',
            resolvedStatus === 'idle' && 'text-muted-foreground/40',
          )}
        />
      ) : orientation === 'vertical' ? (
        <>
          <span>{h}h</span>
          <span>{m}m</span>
          <span>{s}s</span>
        </>
      ) : (
        formattedTime
      )}
    </span>
  )
}

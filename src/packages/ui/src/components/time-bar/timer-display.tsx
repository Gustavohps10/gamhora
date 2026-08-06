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
      className={cn(
        'inline-flex items-center justify-center',
        'font-mono text-[18px] leading-none font-semibold tracking-tight tabular-nums',
        'transition-all duration-300',
        resolvedStatus === 'idle' && 'text-muted-foreground/40',
        resolvedStatus === 'running' && 'text-primary',
        resolvedStatus === 'paused' && 'text-muted-foreground',
        resolvedStatus === 'finished' && 'text-destructive',
        isRunning && !isWarning && 'animate-timer-pulse',
        isWarning && [
          'text-destructive',
          'drop-shadow-[0_0_8px_hsl(var(--destructive)/0.6)]',
          'animate-warning-pulse',
        ],
        resolvedStatus === 'paused' && 'opacity-60',
        className,
      )}
    >
      {canEdit ? (
        <TimerInput
          value={displaySeconds}
          onChange={handleChange}
          className={cn(
            'text-[18px] font-semibold tracking-tight',
            resolvedStatus === 'idle' && 'text-muted-foreground/40',
          )}
        />
      ) : (
        formattedTime
      )}
    </span>
  )
}

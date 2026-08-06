// ─────────────────────────────────────────────
// useActiveTimer.ts
// Bridges the global store ↔ timer engine
// Drives re-renders at ~60fps only when running
// ─────────────────────────────────────────────
'use client'

import { differenceInMilliseconds, parseISO } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { useTimeEntryStore } from '@/stores/timeEntryStore'

/**
 * Returns the live second count for the active time entry.
 * Drives re-renders via requestAnimationFrame only when the
 * timer is running, preventing wasted cycles while paused.
 */
export function useActiveTimer(): number {
  const active = useTimeEntryStore((s) => s.active)
  const [tick, setTick] = useState(0)
  const rafRef = useRef<number>(0)

  const isRunning = active?.timeStatus === 'running'

  useEffect(() => {
    if (!isRunning) return

    const loop = () => {
      setTick((t) => t + 1)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning])

  // Derive seconds from store — pure calculation, no extra state
  if (!active) return 0

  const saved = active.timeSpent ?? 0

  if (active.timeStatus === 'paused') return saved

  if (active.timeStatus === 'running') {
    if (!active.startDate) return saved
    const diffMs = differenceInMilliseconds(
      Date.now(),
      parseISO(active.startDate).getTime(),
    )
    return saved + Math.max(0, Math.floor(diffMs / 1000))
  }

  return saved
}

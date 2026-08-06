// ─────────────────────────────────────────────
// TimerInput.tsx
// Editable input that parses flexible time formats
// ─────────────────────────────────────────────
'use client'

import { KeyboardEvent, useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { formatTime, parseTimeInput } from './timer-engine'

export interface TimerInputProps {
  /** Current value in seconds */
  value: number
  onChange: (seconds: number) => void
  className?: string
  disabled?: boolean
  /** Placeholder shown when value is 0 and not focused */
  placeholder?: string
}

export function TimerInput({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = '0:00:00',
}: TimerInputProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [invalid, setInvalid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = useCallback(() => {
    if (disabled) return
    setEditing(true)
    // Show current formatted value as starting draft
    setDraft(value > 0 ? formatTime(value) : '')
    setInvalid(false)
  }, [disabled, value])

  const commit = useCallback(() => {
    setEditing(false)
    const parsed = parseTimeInput(draft)
    if (parsed === null) {
      if (draft.trim() !== '') setInvalid(true)
      // Revert — don't call onChange
      setTimeout(() => setInvalid(false), 1500)
      return
    }
    setInvalid(false)
    onChange(parsed)
  }, [draft, onChange])

  const handleBlur = useCallback(() => {
    commit()
  }, [commit])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft('')
      setEditing(false)
      setInvalid(false)
      inputRef.current?.blur()
    }
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      value={editing ? draft : formatTime(value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={handleKeyDown}
      style={{ width: '8ch' }}
      className={cn(
        // Base — fixed width, never expands
        'bg-transparent text-center font-mono tabular-nums outline-none',
        'transition-all duration-200',
        // Editable state
        !disabled && [
          'cursor-text',
          'rounded-md',
          'hover:bg-muted/30',
          editing && 'bg-muted/50 ring-primary/40 px-1 ring-1 ring-inset',
        ],
        // Disabled
        disabled && 'cursor-default select-none',
        // Invalid flash
        invalid && 'animate-shake text-destructive',
        className,
      )}
      aria-label="Timer value — type in formats like 1h, 90m, 1:30:00"
    />
  )
}

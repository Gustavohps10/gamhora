import { Search, X } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type LookupSize = 'micro' | 'xs' | 'sm' | 'md' | 'lg'

interface LookupInputProps {
  value: string
  onChange: (value: string) => void
  onOpenLookup?: () => void
  placeholder?: string
  disabled?: boolean
  size?: LookupSize
  className?: string
}

export function LookupInput({
  value,
  onChange,
  onOpenLookup,
  placeholder,
  disabled,
  size = 'md',
  className,
}: LookupInputProps) {
  const sizeConfig: Record<
    LookupSize,
    { input: string; button: string; icon: string; container: string }
  > = {
    micro: {
      input: 'h-[18px] text-[10px] px-1.5 pr-10 rounded-[4px]',
      button: 'h-3.5 w-3.5',
      icon: 'h-2 w-2',
      container: 'gap-0.5 right-0.5',
    },
    xs: {
      input: 'h-6 text-[11px] px-2 pr-12 rounded-md',
      button: 'h-4 w-4',
      icon: 'h-2.5 w-2.5',
      container: 'gap-0.5 right-1',
    },
    sm: {
      input: 'h-8 text-xs px-2.5 pr-14 rounded-md',
      button: 'h-6 w-6',
      icon: 'h-3 w-3',
      container: 'gap-0.5 right-1',
    },
    md: {
      input: 'h-9 text-sm px-3 pr-16 rounded-md',
      button: 'h-7 w-7',
      icon: 'h-3.5 w-3.5',
      container: 'gap-1 right-1',
    },
    lg: {
      input: 'h-10 text-base px-3.5 pr-20 rounded-lg',
      button: 'h-8 w-8',
      icon: 'h-4 w-4',
      container: 'gap-1 right-1.5',
    },
  }

  const config: {
    input: string
    button: string
    icon: string
    container: string
  } = sizeConfig[size]

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'font-mono transition-all focus-visible:ring-1 focus-visible:ring-offset-0',
          config.input,
        )}
      />

      <div
        className={cn(
          'pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center',
          config.container,
        )}
      >
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange('')}
            disabled={disabled}
            className={cn(
              'pointer-events-auto shrink-0 p-0 hover:bg-transparent',
              config.button,
            )}
          >
            <X
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors',
                config.icon,
              )}
            />
          </Button>
        )}

        {onOpenLookup && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onOpenLookup}
            disabled={disabled}
            className={cn(
              'pointer-events-auto shrink-0 p-0 hover:bg-transparent',
              config.button,
            )}
          >
            <Search
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors',
                config.icon,
              )}
            />
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TimeEntriesSyncIndicatorProps {
  isSyncing: boolean
  isPulling?: boolean
  className?: string
}

export function TimeEntriesSyncIndicator({
  isSyncing,
  isPulling,
  className,
}: TimeEntriesSyncIndicatorProps) {
  if (!isSyncing && !isPulling) {
    return null
  }

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-top-1 flex items-center gap-2 transition-all duration-300',
        className,
      )}
    >
      <Badge
        variant="outline"
        className="border-primary/30 bg-primary/5 text-primary flex items-center gap-1.5 py-1 pr-2.5 pl-2 text-xs font-normal shadow-xs backdrop-blur-xs"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin opacity-80" />
        <span className="font-medium">
          {isPulling
            ? 'Buscando novos apontamentos do servidor...'
            : 'Sincronizando com o servidor...'}
        </span>
      </Badge>
    </div>
  )
}

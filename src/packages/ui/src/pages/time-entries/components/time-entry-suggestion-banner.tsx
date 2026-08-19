import { CheckCheck, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface TimeEntrySuggestionBannerProps {
  count: number
  onAcceptAll?: () => void
  onDismissAll?: () => void
}

export function TimeEntrySuggestionBanner({
  count,
  onAcceptAll,
  onDismissAll,
}: TimeEntrySuggestionBannerProps) {
  if (count <= 0) return null

  return (
    <div className="bg-primary/5 border-primary/20 text-foreground flex items-center justify-between rounded-lg border px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">
            {count === 1
              ? '1 sugestão de apontamento gerada localmente por IA'
              : `${count} sugestões de apontamento geradas localmente por IA`}
          </p>
          <p className="text-muted-foreground text-[11px]">
            Revise as atividades e clique em aceitar para confirmar o registro.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onAcceptAll && (
          <Button
            size="sm"
            variant="default"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={onAcceptAll}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Aceitar Todas</span>
          </Button>
        )}
        {onDismissAll && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive h-7 gap-1.5 px-2 text-xs"
            onClick={onDismissAll}
          >
            <X className="h-3.5 w-3.5" />
            <span>Descartar</span>
          </Button>
        )}
      </div>
    </div>
  )
}

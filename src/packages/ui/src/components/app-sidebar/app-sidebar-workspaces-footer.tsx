import { User } from 'lucide-react'

import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AppSidebarWorkspacesFooter() {
  const { open } = useSidebar()

  if (!open) {
    return (
      <div className="flex w-full items-center justify-center p-1 select-none">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hover:bg-muted/60 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors">
                <div className="bg-muted/70 flex size-6 items-center justify-center rounded-sm">
                  <User className="text-muted-foreground size-3.5" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Conta — Modo Local
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="hover:bg-muted/50 text-muted-foreground flex items-center gap-2.5 rounded-md p-2 transition-colors select-none">
      <div className="bg-muted/70 flex size-7 shrink-0 items-center justify-center rounded-sm">
        <User className="text-muted-foreground size-4" />
      </div>
      <div className="min-w-0 flex-1 leading-none">
        <p className="text-foreground truncate text-sm font-medium">Conta</p>
        <p className="text-muted-foreground/70 mt-1 truncate text-xs">
          Modo Local
        </p>
      </div>
    </div>
  )
}

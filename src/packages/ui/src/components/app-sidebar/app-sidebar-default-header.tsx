import { Github, Star } from 'lucide-react'

import logoIcon from '@/assets/logo-icon.svg'
import logoText from '@/assets/logo-text.svg'
import { AppSidebarQuickActions } from '@/components/app-sidebar/app-sidebar-quick-actions'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarHeader, useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AppSidebarDefaultHeader() {
  const { open } = useSidebar()

  if (!open) {
    return (
      <SidebarHeader className="z-40 gap-1.5 p-1 pb-1">
        <div className="flex w-full items-center justify-center py-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hover:bg-muted/60 flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors">
                  <img
                    src={logoIcon}
                    className="size-6 object-contain dark:invert"
                    alt="Mr. Tick"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Mr. Tick (Open Core)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AppSidebarQuickActions />
      </SidebarHeader>
    )
  }

  return (
    <SidebarHeader className="z-40 gap-1.5 pb-1">
      <div className="hover:bg-muted/40 relative flex items-center justify-between gap-3 rounded-lg p-2 transition-colors select-none">
        {/* Lado Esquerdo: Identidade Visual */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7.5 shrink-0 items-center justify-center">
            <img
              src={logoIcon}
              className="h-full w-auto object-contain dark:invert"
              alt="Logo Mr-tick"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <img
              src={logoText}
              className="w-[80px] self-start dark:invert"
              alt="Mr-tick"
            />

            {/* Linha de Metadados: Open Core + GitHub Stars */}
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-muted-foreground/70 font-mono text-[10px] leading-none font-medium tracking-tight">
                Open Core
              </span>

              <div className="bg-border/60 h-2.5 w-px" />

              <a
                href="https://github.com/gustavohps10/mr-tick"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <Github className="text-muted-foreground size-3" />
                <div className="flex items-center gap-0.5">
                  <Star className="size-2.5 fill-amber-400/80 text-transparent" />
                  <span className="text-muted-foreground font-mono text-[10px] font-bold tabular-nums">
                    120
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ação Global */}
        <div className="shrink-0 self-start">
          <ModeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted/70 shrink-0 cursor-pointer rounded-md border-transparent bg-transparent p-1.5 transition-colors" />
        </div>
      </div>

      {/* Barra de Ações Rápidas (Busca, Addons, Configs) */}
      <AppSidebarQuickActions />
    </SidebarHeader>
  )
}

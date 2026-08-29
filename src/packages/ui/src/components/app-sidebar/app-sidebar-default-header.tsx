import { Github, Star } from 'lucide-react'

import logoIcon from '@/assets/logo-icon.svg'
import logoText from '@/assets/logo-text.svg'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarHeader } from '@/components/ui/sidebar'

export function AppSidebarDefaultHeader() {
  return (
    <SidebarHeader className="z-40">
      <div className="relative flex items-center justify-between gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
        {/* Lado Esquerdo: Identidade Visual */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-7 shrink-0 items-center justify-center">
            <img
              src={logoIcon}
              className="h-full w-auto object-contain dark:invert"
              alt="Logo Pandhora"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <img
              src={logoText}
              className="w-[100px] self-start dark:invert"
              alt="Pandhora"
            />

            {/* Linha de Metadados: Open Core + GitHub Stars */}
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] leading-none font-medium tracking-tight text-zinc-400 dark:text-zinc-500">
                Open Core
              </span>

              <div className="h-2 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

              <a
                href="https://github.com/gustavohps10/pandhora"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <Github className="size-2.5 text-zinc-500" />
                <div className="flex items-center gap-0.5">
                  <Star className="size-2 fill-zinc-400 text-transparent dark:fill-zinc-600" />
                  <span className="text-[9px] font-bold tracking-tighter text-zinc-500 tabular-nums">
                    120
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ação Global */}
        <div className="shrink-0 self-start">
          <ModeToggle className="shrink-0 cursor-pointer rounded-md border-transparent bg-transparent p-1.5 text-zinc-500 transition-all hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" />
        </div>
      </div>
    </SidebarHeader>
  )
}

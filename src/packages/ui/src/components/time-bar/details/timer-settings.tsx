// components/time-bar/details/timer-settings.tsx
'use client'

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  ClockArrowDown,
  ClockArrowUp,
  Gamepad2,
  LayoutTemplate,
  LockIcon,
  MonitorPlay,
  Moon,
  Settings2Icon,
  Sparkles,
} from 'lucide-react'
import React, { memo } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useTimerSettings } from '@/hooks/use-timer-settings'
import { cn } from '@/lib/utils'
import { useTimeEntryStore } from '@/stores/timeEntryStore'

type WidgetPosition = 'top' | 'bottom' | 'left' | 'right'

const POSITION_LABEL: Record<WidgetPosition, string> = {
  top: 'Topo',
  bottom: 'Rodapé',
  left: 'Esquerda',
  right: 'Direita',
}

// ---------------------------------------------------------------------------
// Seletor de posição em formato "mira" (crosshair): um retículo central
// representando o widget e 4 direções ao redor, no espírito do seletor de
// âncora do Figma. Mais rápido de ler e de acertar com o mouse do que uma
// grade 2x2 de botões com texto.
function PositionCompass({
  value,
  onChange,
}: {
  value: WidgetPosition
  onChange: (value: WidgetPosition) => void
}) {
  const directions: Array<{
    key: WidgetPosition
    icon: React.ElementType
    className: string
  }> = [
    {
      key: 'top',
      icon: ChevronUp,
      className: 'top-0 left-1/2 -translate-x-1/2',
    },
    {
      key: 'right',
      icon: ChevronRight,
      className: 'right-0 top-1/2 -translate-y-1/2',
    },
    {
      key: 'bottom',
      icon: ChevronDown,
      className: 'bottom-0 left-1/2 -translate-x-1/2',
    },
    {
      key: 'left',
      icon: ChevronLeft,
      className: 'left-0 top-1/2 -translate-y-1/2',
    },
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        {/* Linhas do retículo */}
        <div className="bg-border absolute left-1/2 h-full w-px -translate-x-1/2" />
        <div className="bg-border absolute top-1/2 h-px w-full -translate-y-1/2" />

        {/* Hub central: representa o widget/tela */}
        <div className="bg-muted border-border relative z-10 flex h-8 w-8 items-center justify-center rounded-md border">
          <div className="bg-primary/50 h-2 w-2 rounded-[2px]" />
        </div>

        {directions.map(({ key, icon: Icon, className }) => {
          const selected = value === key
          return (
            <button
              key={key}
              type="button"
              aria-label={`Posicionar no ${POSITION_LABEL[key].toLowerCase()}`}
              aria-pressed={selected}
              onClick={() => onChange(key)}
              className={cn(
                'absolute z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-all',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                className,
                selected
                  ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          )
        })}
      </div>

      <span className="text-muted-foreground text-[11px] font-medium">
        {POSITION_LABEL[value]}
      </span>
    </div>
  )
}

export const TimerSettings = memo(() => {
  const {
    timerDirection,
    setTimerDirection,
    widgetPosition,
    setWidgetPosition,
    discordRpc,
    setDiscordRpc,
    antiBurnout,
    setAntiBurnout,
    activeWindowTracking,
    setActiveWindowTracking,
  } = useTimerSettings()

  const isRunning = useTimeEntryStore((s) => s.active?.timeStatus === 'running')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-[18px] w-[18px] rounded p-0 transition-colors"
        >
          <Settings2Icon className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="bg-card w-[360px] rounded-xl p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-md p-1.5">
              <Settings2Icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Preferências do Tracker</p>
              <p className="text-muted-foreground text-[11px]">
                Personalize seu fluxo de trabalho
              </p>
            </div>
          </div>
          <Sparkles className="text-muted-foreground h-4 w-4" />
        </div>
        <Separator />
        <div className="space-y-3 p-3">
          <div className="bg-muted/30 border-border/50 rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  Modo do Timer
                </span>
              </div>
              {isRunning && (
                <span className="bg-muted text-muted-foreground border-border/60 inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] font-medium">
                  <LockIcon className="h-2.5 w-2.5" />
                  Em execução
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={isRunning}
                variant={timerDirection === 'up' ? 'secondary' : 'ghost'}
                className={cn(
                  'h-8 justify-start gap-2 text-xs',
                  isRunning && 'opacity-50',
                )}
                onClick={() => setTimerDirection('up')}
              >
                <ClockArrowUp className="h-3.5 w-3.5" />
                Normal
              </Button>
              <Button
                disabled={isRunning}
                variant={timerDirection === 'down' ? 'secondary' : 'ghost'}
                className={cn(
                  'h-8 justify-start gap-2 text-xs',
                  isRunning && 'opacity-50',
                )}
                onClick={() => setTimerDirection('down')}
              >
                <ClockArrowDown className="h-3.5 w-3.5" />
                Pomodoro
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 border-border/50 rounded-xl border p-3">
            <div className="mb-3 flex items-center gap-2">
              <LayoutTemplate className="text-muted-foreground h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">
                Posição do Widget
              </span>
            </div>
            <PositionCompass
              value={widgetPosition as WidgetPosition}
              onChange={setWidgetPosition}
            />
          </div>

          <div className="bg-muted/30 border-border/50 rounded-xl border p-3">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="text-muted-foreground h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">
                Automações
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                  htmlFor="discord-rpc"
                >
                  <Gamepad2 className="text-muted-foreground h-3.5 w-3.5" />
                  Discord RPC
                </Label>
                <Switch
                  id="discord-rpc"
                  checked={discordRpc}
                  onCheckedChange={setDiscordRpc}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                  htmlFor="anti-burnout"
                >
                  <Moon className="text-muted-foreground h-3.5 w-3.5" />
                  Anti-Burnout (4h)
                </Label>
                <Switch
                  id="anti-burnout"
                  checked={antiBurnout}
                  onCheckedChange={setAntiBurnout}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                  htmlFor="active-window"
                >
                  <MonitorPlay className="text-muted-foreground h-3.5 w-3.5" />
                  Rastrear janela ativa
                </Label>
                <Switch
                  id="active-window"
                  checked={activeWindowTracking}
                  onCheckedChange={setActiveWindowTracking}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

TimerSettings.displayName = 'TimerSettings'

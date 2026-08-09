'use client'

import { DisplayInfo } from '@metric-org/application'
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
  Monitor,
  MonitorPlay,
  Moon,
  Settings2Icon,
  X,
} from 'lucide-react'
import React, { memo, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useClient } from '@/hooks'
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
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <div className="bg-border absolute left-1/2 h-full w-px -translate-x-1/2" />
        <div className="bg-border absolute top-1/2 h-px w-full -translate-y-1/2" />
        <div className="bg-muted border-border relative z-10 flex h-6 w-6 items-center justify-center rounded-md border">
          <div className="bg-primary/50 h-1.5 w-1.5 rounded-[1px]" />
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
                'absolute z-10 flex h-5 w-5 items-center justify-center rounded-full border transition-all focus-visible:outline-none',
                className,
                selected
                  ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-2.5 w-2.5" />
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
  const client = useClient()
  const {
    timerDirection,
    setTimerDirection,
    widgetPosition,
    setWidgetPosition,
    selectedDisplayId,
    setSelectedDisplayId,
    discordRpc,
    setDiscordRpc,
    antiBurnout,
    setAntiBurnout,
    activeWindowTracking,
    setActiveWindowTracking,
  } = useTimerSettings()

  const [isOpen, setIsOpen] = useState(false)
  const isRunning = useTimeEntryStore((s) => s.active?.timeStatus === 'running')
  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    client.modules.system.getDisplays().then((list) => {
      setDisplays(list)

      if (list.length > 0 && initialLoad) {
        const savedDisplay = list.find((d) => d.id === selectedDisplayId)
        const displayToUse =
          savedDisplay || list.find((d) => d.isPrimary) || list[0]

        if (displayToUse.id !== selectedDisplayId) {
          setSelectedDisplayId(displayToUse.id)
        }

        // Move a janela imediatamente para o display salvo quando o React monta
        client.modules.system.moveToDisplay({
          body: { displayId: displayToUse.id, windowType: 'widget' },
        })
        setInitialLoad(false)
      }
    })
  }, [client, selectedDisplayId, setSelectedDisplayId, initialLoad])

  const handleDisplayChange = async (displayIdStr: string) => {
    const displayId = Number(displayIdStr)
    setSelectedDisplayId(displayId)

    await client.modules.system.moveToDisplay({
      body: { displayId, windowType: 'widget' },
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        className="bg-card w-[260px] rounded-lg p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <div className="bg-primary/10 text-primary rounded-md p-1">
              <Settings2Icon className="h-3 w-3" />
            </div>
            <p className="text-[13px] font-semibold">Preferências</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <X className="text-muted-foreground hover:text-foreground h-3.5 w-3.5" />
          </Button>
        </div>
        <Separator />

        <div className="space-y-2 p-2">
          {displays.length > 1 && (
            <div className="bg-muted/30 border-border/50 rounded-lg border p-2">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Monitor className="text-muted-foreground h-3 w-3" />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  Monitor
                </span>
              </div>
              <Select
                value={selectedDisplayId?.toString() ?? ''}
                onValueChange={handleDisplayChange}
              >
                <SelectTrigger className="h-7 w-full text-[11px]">
                  <SelectValue placeholder="Selecione o monitor" />
                </SelectTrigger>
                <SelectContent>
                  {displays.map((display) => (
                    <SelectItem
                      key={display.id}
                      value={display.id.toString()}
                      className="text-[11px]"
                    >
                      {display.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted/30 border-border/50 rounded-lg border p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock3 className="text-muted-foreground h-3 w-3" />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  Modo do Timer
                </span>
              </div>
              {isRunning && (
                <span className="bg-muted text-muted-foreground border-border/60 inline-flex items-center gap-1 rounded-[2px] border px-1 py-[1px] text-[8px] font-medium">
                  <LockIcon className="h-2 w-2" /> Em execução
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                disabled={isRunning}
                variant={timerDirection === 'up' ? 'secondary' : 'ghost'}
                className={cn(
                  'h-6 justify-start gap-1.5 px-2 text-[11px]',
                  isRunning && 'opacity-50',
                )}
                onClick={() => setTimerDirection('up')}
              >
                <ClockArrowUp className="h-3 w-3" /> Normal
              </Button>
              <Button
                disabled={isRunning}
                variant={timerDirection === 'down' ? 'secondary' : 'ghost'}
                className={cn(
                  'h-6 justify-start gap-1.5 px-2 text-[11px]',
                  isRunning && 'opacity-50',
                )}
                onClick={() => setTimerDirection('down')}
              >
                <ClockArrowDown className="h-3 w-3" /> Pomodoro
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 border-border/50 rounded-lg border p-2">
            <div className="mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="text-muted-foreground h-3 w-3" />
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                Ancoragem
              </span>
            </div>
            <PositionCompass
              value={widgetPosition as WidgetPosition}
              onChange={setWidgetPosition}
            />
          </div>

          <div className="bg-muted/30 border-border/50 rounded-lg border p-2">
            <div className="mb-2 flex items-center gap-1.5">
              <Gamepad2 className="text-muted-foreground h-3 w-3" />
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                Automações
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium"
                  htmlFor="discord-rpc"
                >
                  Discord RPC
                </Label>
                <Switch
                  id="discord-rpc"
                  className="scale-75"
                  checked={discordRpc}
                  onCheckedChange={setDiscordRpc}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium"
                  htmlFor="anti-burnout"
                >
                  <Moon className="text-muted-foreground h-3 w-3" />{' '}
                  Anti-Burnout (4h)
                </Label>
                <Switch
                  id="anti-burnout"
                  className="scale-75"
                  checked={antiBurnout}
                  onCheckedChange={setAntiBurnout}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium"
                  htmlFor="active-window"
                >
                  <MonitorPlay className="text-muted-foreground h-3 w-3" />{' '}
                  Rastrear janela
                </Label>
                <Switch
                  id="active-window"
                  className="scale-75"
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

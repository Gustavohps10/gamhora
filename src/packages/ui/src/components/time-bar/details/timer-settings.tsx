'use client'

import {
  Clock3,
  ClockArrowDown,
  ClockArrowUp,
  Gamepad2,
  LayoutTemplate,
  Minus,
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

interface TimerSettingsProps {
  timerDirection: 'up' | 'down'
  setTimerDirection: (val: 'up' | 'down') => void
  widgetLayout: 'horizontal' | 'vertical'
  setWidgetLayout: (val: 'horizontal' | 'vertical') => void
}

export const TimerSettings = memo(
  ({
    timerDirection,
    setTimerDirection,
    widgetLayout,
    setWidgetLayout,
  }: TimerSettingsProps) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-[18px] w-[18px] rounded p-0"
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
                <p className="text-sm font-semibold">Tracker Preferences</p>
                <p className="text-muted-foreground text-[11px]">
                  Personalize your workflow
                </p>
              </div>
            </div>
            <Sparkles className="text-muted-foreground h-4 w-4" />
          </div>
          <Separator />
          <div className="space-y-3 p-3">
            <div className="bg-muted/30 rounded-xl border p-3">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  Timer mode
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={timerDirection === 'up' ? 'secondary' : 'ghost'}
                  className="h-8 justify-start gap-2 text-xs"
                  onClick={() => setTimerDirection('up')}
                >
                  <ClockArrowUp className="h-3.5 w-3.5" />
                  Normal
                </Button>
                <Button
                  variant={timerDirection === 'down' ? 'secondary' : 'ghost'}
                  className="h-8 justify-start gap-2 text-xs"
                  onClick={() => setTimerDirection('down')}
                >
                  <ClockArrowDown className="h-3.5 w-3.5" />
                  Pomodoro
                </Button>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl border p-3">
              <div className="mb-2 flex items-center gap-2">
                <LayoutTemplate className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  Layout
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={
                    widgetLayout === 'horizontal' ? 'secondary' : 'ghost'
                  }
                  className="h-8 justify-start gap-2 text-xs"
                  onClick={() => setWidgetLayout('horizontal')}
                >
                  <Minus className="h-3.5 w-3.5" />
                  Barra
                </Button>
                <Button
                  variant={widgetLayout === 'vertical' ? 'secondary' : 'ghost'}
                  className="h-8 justify-start gap-2 text-xs"
                  onClick={() => setWidgetLayout('vertical')}
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  Em pé
                </Button>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl border p-3">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  Automations
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Gamepad2 className="text-muted-foreground h-3.5 w-3.5" />
                    Discord RPC
                  </Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Moon className="text-muted-foreground h-3.5 w-3.5" />
                    Anti-Burnout (4h)
                  </Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <MonitorPlay className="text-muted-foreground h-3.5 w-3.5" />
                    Active window tracking
                  </Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)

TimerSettings.displayName = 'TimerSettings'

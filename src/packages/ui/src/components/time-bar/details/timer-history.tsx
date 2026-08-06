'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Database,
  History,
  Pause,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react'
import React, { memo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type SessionStatus = 'STOP' | 'CONTINUE' | 'PAUSE' | 'START'

interface SessionEntry {
  id: string
  time: string
  status: SessionStatus
  taskId: string
  description: string
}

const mockHistory: SessionEntry[] = [
  {
    id: '1',
    time: '14:30:00',
    status: 'STOP',
    taskId: 'CH-402',
    description: 'Completed API endpoint integration',
  },
  {
    id: '2',
    time: '13:15:22',
    status: 'CONTINUE',
    taskId: 'CH-402',
    description: 'Resumed after lunch break',
  },
  {
    id: '3',
    time: '12:30:00',
    status: 'PAUSE',
    taskId: 'CH-402',
    description: 'Lunch break',
  },
  {
    id: '4',
    time: '09:05:14',
    status: 'START',
    taskId: 'CH-402',
    description: 'Initial setup and boilerplate for new feature',
  },
]

export const TimerHistory = memo(() => {
  const renderStatus = (status: SessionStatus) => {
    switch (status) {
      case 'STOP':
        return (
          <span className="text-destructive flex items-center text-[10px] font-bold tracking-wider uppercase">
            <span className="bg-destructive mr-1 h-1.5 w-1.5 rounded-full" />
            {status}
          </span>
        )
      case 'CONTINUE':
      case 'START':
        return (
          <span className="text-primary flex items-center text-[10px] font-bold tracking-wider uppercase">
            <Play className="mr-0.5 h-2.5 w-2.5 fill-current" />
            {status}
          </span>
        )
      case 'PAUSE':
        return (
          <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <span className="bg-muted flex items-center justify-center rounded px-1 py-0.5">
              <Pause className="h-2.5 w-2.5 fill-current" />
            </span>
            {status}
          </span>
        )
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-[18px] w-[18px] rounded p-0"
        >
          <History className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="bg-card w-[340px] overflow-hidden rounded-lg p-0 shadow-lg"
      >
        <div className="flex items-center justify-between p-3">
          <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Database className="text-primary h-3.5 w-3.5" />
            Session History
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            Today <Calendar className="h-3.5 w-3.5" />
          </div>
        </div>
        <Separator />
        <div className="flex max-h-[250px] flex-col overflow-y-auto">
          {mockHistory.map((entry: SessionEntry, index: number) => (
            <React.Fragment key={entry.id}>
              <div className="group hover:bg-muted/30 flex flex-col gap-2 p-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground font-mono text-xs font-medium tracking-tight">
                      {entry.time}
                    </span>
                    {renderStatus(entry.status)}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md"
                    >
                      <Pencil className="text-muted-foreground h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md"
                    >
                      <Trash2 className="text-muted-foreground h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-[10px] font-medium">
                    {entry.taskId}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {entry.description}
                  </span>
                </div>
              </div>
              {index < mockHistory.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
        <Separator />
        <div className="bg-muted/10 flex items-center justify-between p-2">
          <span className="text-muted-foreground px-1 text-[10px] font-medium">
            {mockHistory.length} entries
          </span>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

TimerHistory.displayName = 'TimerHistory'

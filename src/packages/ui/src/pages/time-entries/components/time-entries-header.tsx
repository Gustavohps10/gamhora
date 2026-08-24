import { DateRange } from 'react-day-picker'

import { DatePickerWithRange } from '@/components'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TimeEntriesSyncIndicator } from '@/pages/time-entries/components/time-entries-sync-indicator'

interface TimeEntriesHeaderProps {
  range: { from: Date; to: Date }
  onRangeChange: (range: DateRange | undefined) => void
  isSyncing?: boolean
  isPulling?: boolean
  isGrouped?: boolean
  onToggleGrouped?: (grouped: boolean) => void
}

export function TimeEntriesHeader({
  range,
  onRangeChange,
  isSyncing = false,
  isPulling = false,
  isGrouped = true,
  onToggleGrouped,
}: TimeEntriesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Visão Geral</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Apontamentos de Horas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-3">
          <TimeEntriesSyncIndicator
            isSyncing={isSyncing}
            isPulling={isPulling}
          />
          <DatePickerWithRange
            date={{ from: range.from, to: range.to }}
            setDate={onRangeChange}
          />
        </div>

        {onToggleGrouped && (
          <div className="flex items-center gap-2 pr-1">
            <Switch
              id="group-by-task-switch"
              checked={isGrouped}
              onCheckedChange={onToggleGrouped}
              className="scale-90"
            />
            <Label
              htmlFor="group-by-task-switch"
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium select-none"
            >
              Agrupar por tarefa
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}

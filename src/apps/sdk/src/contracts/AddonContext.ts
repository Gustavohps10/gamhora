import { IEventEmitter, ISystemEvents } from '@metric-org/shared/transport'

import { ICommandRegistry } from './commands/ICommandRegistry'
import { IDataSourceRegistry } from './datasource/IDataSourceRegistry'
import { IMenusRegistry } from './menus/IMenusRegistry'
import { INotificationService } from './notifications/INotificationService'
import { ITimeEntriesAPI } from './timer/ITimeEntriesAPI'
import { ITimerAPI } from './timer/ITimerAPI'

export interface AddonContext {
  readonly addonId: string
  readonly commands: ICommandRegistry
  readonly menus: IMenusRegistry
  readonly dataSources: IDataSourceRegistry
  readonly events: IEventEmitter<ISystemEvents>
  readonly notifications: INotificationService
  readonly timer: ITimerAPI
  readonly timeEntries: ITimeEntriesAPI
}

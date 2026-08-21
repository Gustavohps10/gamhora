import { IEventEmitter, ISystemEvents } from '@metric-org/shared/transport'

import { ICommandRegistry } from './commands/ICommandRegistry'
import { IDataSourceRegistry } from './datasource/IDataSourceRegistry'
import { IMenusRegistry } from './menus/IMenusRegistry'
import { INotificationService } from './notifications/INotificationService'
import { ITimeEntriesAPI } from './timer/ITimeEntriesAPI'
import { ITimerAPI } from './timer/ITimerAPI'

export interface IAddonEventsAPI extends IEventEmitter<ISystemEvents> {
  onTimerStart(
    callback: (payload: ISystemEvents['timer:start']) => void,
  ): () => void
  onTimerPause(
    callback: (payload: ISystemEvents['timer:pause']) => void,
  ): () => void
  onTimerResume(
    callback: (payload: ISystemEvents['timer:resume']) => void,
  ): () => void
  onTimerStop(
    callback: (payload: ISystemEvents['timer:stop']) => void,
  ): () => void
  onTimerUpdate(
    callback: (payload: ISystemEvents['timer:update']) => void,
  ): () => void
  onSystemIdle(
    callback: (payload: ISystemEvents['system:idle']) => void,
  ): () => void
  onSystemActive(
    callback: (payload: ISystemEvents['system:active']) => void,
  ): () => void
  onTimeEntryCreated(
    callback: (payload: ISystemEvents['timeEntry:created']) => void,
  ): () => void
  onTimeEntryUpdated(
    callback: (payload: ISystemEvents['timeEntry:updated']) => void,
  ): () => void
  onTimeEntryDeleted(
    callback: (payload: ISystemEvents['timeEntry:deleted']) => void,
  ): () => void
}

export interface AddonContext {
  readonly addonId: string
  readonly commands: ICommandRegistry
  readonly menus: IMenusRegistry
  readonly dataSources: IDataSourceRegistry
  readonly events: IAddonEventsAPI
  readonly notifications: INotificationService
  readonly timer: ITimerAPI
  readonly timeEntries: ITimeEntriesAPI
}

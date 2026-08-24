import { IRegistry } from '../common/IRegistry'
import { SidebarMenuItem } from './sidebar'
import { TimerbarMenuItem } from './timerbar'

export interface IMenusRegistry {
  readonly sidebar: IRegistry<SidebarMenuItem>
  readonly timerbar: IRegistry<TimerbarMenuItem>
}

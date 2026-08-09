import { ISystemAPI } from '@metric-org/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const systemInvoker: ISystemAPI = {
  getAppVersion: () => IpcInvoker.invoke('SYSTEM_VERSION'),
  getEnvironment: () => IpcInvoker.invoke('SYSTEM_GET_ENVIRONMENT'),
  setIgnoreMouseEvents: (ignore: boolean) =>
    IpcInvoker.invoke('WIDGET_SET_IGNORE_MOUSE', { body: { ignore } }),
  getDisplays: () => IpcInvoker.invoke('SYSTEM_GET_DISPLAYS'),
  moveToDisplay: (input) => IpcInvoker.invoke('SYSTEM_MOVE_TO_DISPLAY', input),
}

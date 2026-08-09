import { ISystemAPI } from '@metric-org/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker' // ou no seu caminho de import

export const systemInvoker: ISystemAPI = {
  getAppVersion: () => IpcInvoker.invoke('SYSTEM_VERSION'),
  getEnvironment: () => IpcInvoker.invoke('SYSTEM_GET_ENVIRONMENT'),
  setIgnoreMouseEvents: (ignore: boolean) =>
    IpcInvoker.invoke('WIDGET_SET_IGNORE_MOUSE', { body: { ignore } }),
}

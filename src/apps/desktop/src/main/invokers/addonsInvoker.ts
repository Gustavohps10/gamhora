import { FileData, IAddonsAPI } from '@metric-org/application'
import { IRequest } from '@metric-org/shared/transport'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const addonsInvoker: IAddonsAPI = {
  getInstalledById: (payload: IRequest<{ addonId: string }>) =>
    IpcInvoker.invoke('ADDONS_GETINSTALLED_BY_ID', payload),

  listAvailable: () => IpcInvoker.invoke('ADDONS_LIST_AVAILABLE'),
  listInstalled: () => IpcInvoker.invoke('ADDONS_LIST_INSTALLED'),

  updateLocal: (payload) => IpcInvoker.invoke('ADDONS_UPDATE_LOCAL', payload),

  import: (payload: IRequest<{ addon: FileData }>) =>
    IpcInvoker.invoke('ADDONS_IMPORT', payload),

  getInstaller: (payload: IRequest<{ installerUrl: string }>) =>
    IpcInvoker.invoke('ADDONS_GET_INSTALLER', payload),

  install: (
    payload: IRequest<
      { downloadUrl: string } & { onProgress?: (progress: number) => void }
    >,
  ) => IpcInvoker.invoke('ADDONS_INSTALL', payload),

  getSidebarMenus: () => IpcInvoker.invoke('ADDONS_GET_SIDEBAR_MENUS'),
  getTimerbarMenus: () => IpcInvoker.invoke('ADDONS_GET_TIMERBAR_MENUS'),
  executeCommand: (payload: IRequest<{ commandId: string; args?: any[] }>) =>
    IpcInvoker.invoke('ADDONS_EXECUTE_COMMAND', payload),
  showToast: (payload) => IpcInvoker.invoke('ADDONS_SHOW_TOAST', payload),
  dismissToast: (payload) => IpcInvoker.invoke('ADDONS_DISMISS_TOAST', payload),
  getSchema: (payload) => IpcInvoker.invoke('ADDON_GET_SCHEMA', payload),
  getSettings: (payload) => IpcInvoker.invoke('ADDON_GET_SETTINGS', payload),
  saveSettings: (payload) => IpcInvoker.invoke('ADDON_SAVE_SETTINGS', payload),
  executeAction: (payload) =>
    IpcInvoker.invoke('ADDON_EXECUTE_ACTION', payload),
  setActiveWorkspace: (payload) =>
    IpcInvoker.invoke('ADDONS_SET_ACTIVE_WORKSPACE', payload),
}

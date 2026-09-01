import { ITokenStorageAPI } from '@mr-tick/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const tokenStorageInvoker: ITokenStorageAPI = {
  saveToken: (payload) => IpcInvoker.invoke('SAVE_TOKEN', payload),
  getToken: (payload) => IpcInvoker.invoke('GET_TOKEN', payload),
  deleteToken: (payload) => IpcInvoker.invoke('DELETE_TOKEN', payload),
}

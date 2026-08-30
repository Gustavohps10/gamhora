import { ElectronAPI } from '@electron-toolkit/preload'

import type { IOpenAPI } from '@pandhora/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IOpenAPI
  }
}

import { ElectronAPI } from '@electron-toolkit/preload'
import type { IOpenAPI } from '@gamhora/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IOpenAPI
  }
}


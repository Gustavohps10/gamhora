import { ElectronAPI } from '@electron-toolkit/preload'

import type { IOpenAPI } from '@mr-tick/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IOpenAPI
  }
}

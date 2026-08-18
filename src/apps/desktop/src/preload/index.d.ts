import { ElectronAPI } from '@electron-toolkit/preload'
import type { IOpenAPI } from '@metric-org/application'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IOpenAPI
  }
}

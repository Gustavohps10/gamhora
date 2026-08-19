import { AddonContext } from '@/contracts/AddonContext'

export interface IAddon {
  activate(context: AddonContext): Promise<void> | void
  deactivate?(): Promise<void> | void
}

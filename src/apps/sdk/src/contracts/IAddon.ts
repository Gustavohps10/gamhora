import { AddonContext } from '@/contracts/AddonContext'

export interface AddonMetadata {
  id?: string
  name?: string
  iconUrl?: string
}

export interface IAddon {
  metadata?: AddonMetadata
  activate(context: AddonContext): Promise<void> | void
  deactivate?(): Promise<void> | void
}

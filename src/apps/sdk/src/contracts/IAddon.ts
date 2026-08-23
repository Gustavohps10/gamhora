import { AddonContext } from '@/contracts/AddonContext'

export interface AddonMetadata {
  id?: string
  name?: string
  iconUrl?: string
}

export type AddonSettingsFieldType = 'button' | 'text' | 'password' | 'checkbox'

export interface AddonSettingsField {
  id: string
  type: AddonSettingsFieldType
  label: string
  defaultValue?: any
  description?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
}

export interface IAddon {
  metadata?: AddonMetadata
  activate(context: AddonContext): Promise<void> | void
  deactivate?(): Promise<void> | void
  getSettingsSchema?(): AddonSettingsField[] | Promise<AddonSettingsField[]>
  executeAction?(actionId: string, payload?: any): Promise<any> | any
}

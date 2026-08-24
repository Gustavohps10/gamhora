import { AddonContext } from '@/contracts/AddonContext'

export type AddonSettingsFieldType =
  | 'text'
  | 'password'
  | 'number'
  | 'boolean'
  | 'select'
  | 'button'
  | 'file'
  | 'directory'
  | 'datasource-instances'
  | 'info-card'

export interface AddonSettingsOption {
  label: string
  value: string | number | boolean
}

export interface AddonSettingsField {
  id: string
  type: AddonSettingsFieldType
  label: string
  defaultValue?: any
  description?: string
  placeholder?: string
  options?: AddonSettingsOption[] // For select
  actionId?: string // For button
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  display?: {
    title?: string
    message?: string
    avatarUrl?: string
    data?: Record<string, string>
  } // For info-card
}

export interface AddonSettingsGroup {
  id: string
  label: string
  description?: string
  fields: AddonSettingsField[]
}

export interface AddonSettingsTab {
  id: string
  label: string
  description?: string
  groups?: AddonSettingsGroup[]
  fields?: AddonSettingsField[]
}

export type AddonSettingsSchema = AddonSettingsTab[] | AddonSettingsField[]

export interface AddonActionResponse {
  isSuccess: boolean
  error?: string
  display?: {
    title?: string
    message?: string
    avatarUrl?: string
    data?: Record<string, string>
  }
}

export interface IAddon {
  activate(context: AddonContext): Promise<void> | void
  deactivate?(): Promise<void> | void
  getSettingsSchema?(): AddonSettingsSchema | Promise<AddonSettingsSchema>
  executeAction?(
    actionId: string,
    payload?: any,
  ): Promise<AddonActionResponse | any> | any
}

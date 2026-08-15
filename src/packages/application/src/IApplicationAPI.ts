import { IHeaders, IJobResult, IRequest } from '@metric-org/shared/transport'
import {
  AddonInstallerViewModel,
  AddonManifestViewModel,
  ConnectionResultViewModel,
  MemberViewModel,
  MetadataViewModel,
  PaginatedViewModel,
  SyncDocumentViewModel,
  TaskViewModel,
  TimeEntryViewModel,
  ViewModel,
  WorkspaceViewModel,
} from '@metric-org/shared/view-models'

import { FileData } from '@/contracts/infra'
import {
  PushTimeEntriesInput,
  UpdateWorkspaceIdentityInput,
} from '@/contracts/use-cases'

export interface ConfigField {
  id: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
}

export interface FieldGroup {
  id: string
  label: string
  description?: string
  fields: ConfigField[]
}

export interface IWorkspacesAPI {
  create(
    input: IRequest<{
      name: string
      description?: string
      avatarFile?: FileData
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  markWorkspaceAsConfigured(
    input: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel>

  getById(
    input: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  listAll(): Promise<PaginatedViewModel<WorkspaceViewModel[]>>

  getDataSourceFields(input: IRequest<{ pluginId: string }>): Promise<{
    credentials: FieldGroup[]
    configuration: FieldGroup[]
  }>

  linkDataSource(
    input: IRequest<{
      workspaceId: string
      dataSourceId: string
      connectionInstanceId: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  unlinkDataSource(
    input: IRequest<{
      workspaceId: string
      connectionInstanceId: string
    }>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  connectDataSource(
    input: IRequest<{
      workspaceId: string
      pluginId: string
      connectionInstanceId: string
      credentials: Record<string, unknown>
      configuration: Record<string, unknown>
    }>,
  ): Promise<ViewModel<ConnectionResultViewModel>>

  disconnectDataSource(
    input: IRequest<{
      workspaceId: string
      connectionInstanceId: string
    }>,
  ): Promise<ViewModel>

  getConnectionMember(
    input: IRequest<{
      workspaceId: string
      connectionInstanceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel | null>>

  updateIdentity(
    input: IRequest<UpdateWorkspaceIdentityInput>,
  ): Promise<ViewModel<WorkspaceViewModel>>

  delete(input: IRequest<{ workspaceId: string }>): Promise<ViewModel<void>>
}

export interface ISessionAPI {
  getCurrentUser(
    input: IRequest<{
      workspaceId: string
      connectionInstanceId: string
    }>,
  ): Promise<ViewModel<MemberViewModel>>
}

export interface ITaskAPI {
  listTasks: (
    input: IRequest<{
      workspaceId: string
      connectionInstanceId: string
    }>,
  ) => Promise<PaginatedViewModel<TaskViewModel[]>>

  pull: (
    payload: IRequest<{
      workspaceId: string
      connectionInstanceId: string
      checkpoint: { updatedAt: Date; id: string }
      batch: number
    }>,
  ) => Promise<ViewModel<TaskViewModel[]>>
}

export interface IMetadataAPI {
  pull: (
    payload: IRequest<{
      workspaceId: string
      connectionInstanceId: string
      checkpoint: { updatedAt: Date; id: string }
      batch: number
    }>,
  ) => Promise<ViewModel<MetadataViewModel>>
}

export interface ITimeEntriesAPI {
  listTimeEntries: (
    payload: IRequest<{
      workspaceId: string
      connectionInstanceId: string
      startDate: Date
      endDate: Date
    }>,
  ) => Promise<PaginatedViewModel<TimeEntryViewModel[]>>

  pull: (
    payload: IRequest<{
      workspaceId: string
      connectionInstanceId: string
      checkpoint: { updatedAt: Date; id: string }
      batch: number
    }>,
  ) => Promise<ViewModel<TimeEntryViewModel[]>>

  push: (
    payload: IRequest<PushTimeEntriesInput>,
  ) => Promise<ViewModel<SyncDocumentViewModel<TimeEntryViewModel>[]>>
}

export interface IHeadersAPI {
  setDefaultHeaders(headers: IHeaders): void
  getDefaultHeaders(): IHeaders
}

export interface ITokenStorageAPI {
  saveToken(
    request: IRequest<{
      service: string
      account: string
      token?: string
    }>,
  ): Promise<ViewModel<void>>

  getToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<string | null>>

  deleteToken(
    request: IRequest<{
      service: string
      account: string
    }>,
  ): Promise<ViewModel<void>>
}

export interface IDiscordAPI {
  login(): Promise<{
    id: string
    username: string
    avatar: string
    global_name: string | null
    avatarUrl: string
  }>
}

export interface AddonManifest {
  id: string
  name: string
  creator: string
  description: string
  path: string
  logo: string
  downloads: number
  version: string
  stars: number
  installed: boolean
  installerManifestUrl?: string
  sourceUrl?: string
  tags?: string[]
}

export interface AddonInstaller {
  id: string
  packages: {
    version: string
    requiredApiVersion: string
    releaseDate: string
    downloadUrl: string
    changelog: string[]
  }[]
}

export interface IAddonsAPI {
  listAvailable(): Promise<PaginatedViewModel<AddonManifestViewModel[]>>

  listInstalled(): Promise<PaginatedViewModel<AddonManifestViewModel[]>>

  getInstalledById(
    payload: IRequest<{ addonId: string }>,
  ): Promise<ViewModel<AddonManifestViewModel>>

  updateLocal(payload: IRequest<AddonManifest>): Promise<ViewModel<void>>

  import(payload: IRequest<{ addon: FileData }>): Promise<ViewModel<void>>

  getInstaller(
    payload: IRequest<{ installerUrl: string }>,
  ): Promise<ViewModel<AddonInstallerViewModel>>

  install(
    payload: IRequest<{ downloadUrl: string }>,
  ): Promise<ViewModel<IJobResult>>
}

export interface EnvironmentInfo {
  isDevelopment: boolean
}

export interface DisplayInfo {
  id: number
  label: string
  isPrimary: boolean
}

export interface MoveToDisplayInput {
  displayId: number
  windowType?: 'main' | 'widget' | string
}

export interface AppSettings {
  startMinimized?: boolean
}

export interface ISystemAPI {
  getAppVersion(): Promise<string>
  getEnvironment(): Promise<EnvironmentInfo>
  setIgnoreMouseEvents(
    payload: IRequest<{ ignore: boolean; forward: boolean }>,
  ): Promise<void>
  getDisplays(): Promise<DisplayInfo[]>
  moveToDisplay(input: IRequest<MoveToDisplayInput>): Promise<void>
  minimizeWindow(windowType?: string): Promise<void>
  maximizeWindow(windowType?: string): Promise<void>
  unmaximizeWindow(windowType?: string): Promise<void>
  closeWindow(windowType?: string): Promise<void>
  hideWindow(windowType?: string): Promise<void>
  showWindow(windowType?: string): Promise<void>
  isMaximized(windowType?: string): Promise<boolean>
  getSettings(): Promise<AppSettings>
  saveSettings(settings: AppSettings): Promise<void>
}

export interface TimerStartInput {
  initialSeconds: number
  mode: 'countup' | 'countdown'
}

export interface TimerResumeInput {
  initialSeconds: number
}

export interface ITimerAPI {
  start(input: TimerStartInput): void
  pause(): void
  resume(input: TimerResumeInput): void
  stop(): void
}

export interface IEventAPI {
  on<T = unknown>(channel: string, handler: (data: T) => void): () => void
}

export interface IApplicationAPI {
  timer: ITimerAPI
  services: {
    workspaces: IWorkspacesAPI
    session: ISessionAPI
    tasks: ITaskAPI
    timeEntries: ITimeEntriesAPI
    metadata: IMetadataAPI
  }
  modules: {
    headers: IHeadersAPI
    tokenStorage: ITokenStorageAPI
    system: ISystemAPI
  }
  integrations: {
    discord: IDiscordAPI
    addons: IAddonsAPI
  }
  events: IEventAPI
}

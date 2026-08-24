export interface IHttpClient {
  get<T = unknown>(url: string, config?: unknown): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
  delete<T = unknown>(url: string, config?: unknown): Promise<T>
}

import { MemberDTO } from '@/dtos'

import type { AddonSettingsGroup } from '../../open-api/IOpenAPI'
import { IDataSourceAdapter } from './IDataSourceAdapter'

export interface DataSourceContext {
  httpClient: IHttpClient
  authenticatedMemberData?: MemberDTO
  config?: Record<string, unknown>
  credentials?: Record<string, unknown>
}

export interface ResolvedConnection {
  id: string
  dataSourceId: string
  config?: Record<string, unknown>
}

export interface IDataSourceResolver {
  getDataSource(
    workspaceId: string,
    pluginId: string,
    contextOverride?: Partial<DataSourceContext>,
  ): Promise<IDataSourceAdapter>

  getDataSourcesForWorkspace(workspaceId: string): Promise<ResolvedConnection[]>

  getConfigFields(pluginId: string): Promise<{
    credentials: AddonSettingsGroup[]
    configuration: AddonSettingsGroup[]
  }>
}

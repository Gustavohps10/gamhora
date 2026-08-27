import { AppError, Either } from '@gamhora/shared/helpers'

import { MemberDTO } from '@/dtos'

import type { AddonSettingsGroup } from '../../open-api/IOpenAPI'
import { IDataSourceAdapter } from './IDataSourceAdapter'

export interface IHttpClientConfig {
  baseURL: string
  params?: Record<string, string>
  headers?: Record<string, string>
  timeout?: number
}

export interface IHttpClient {
  configure(config: IHttpClientConfig): void
  get<T>(url: string, config?: unknown): Promise<Either<AppError, T>>
  post<T>(
    url: string,
    data?: unknown,
    config?: unknown,
  ): Promise<Either<AppError, T>>
  put<T>(
    url: string,
    data?: unknown,
    config?: unknown,
  ): Promise<Either<AppError, T>>
  patch<T>(
    url: string,
    data?: unknown,
    config?: unknown,
  ): Promise<Either<AppError, T>>
  delete<T>(url: string, config?: unknown): Promise<Either<AppError, T>>
}

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

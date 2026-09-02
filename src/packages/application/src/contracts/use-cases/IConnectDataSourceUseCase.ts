import { AppError, Either } from '@mr-tick/shared/helpers'

import { ConnectionResultDTO } from '@/dtos/ConnectionResultDTO'

export interface ConnectDataSourceInput<Credentials, Configuration> {
  workspaceId: string
  connectionInstanceId: string
  pluginId: string
  credentials: Credentials
  configuration: Configuration
}

export interface IConnectDataSourceUseCase {
  execute<Credentials, Configuration extends Record<string, unknown>>(
    input: ConnectDataSourceInput<Credentials, Configuration>,
  ): Promise<Either<AppError, ConnectionResultDTO>>
}

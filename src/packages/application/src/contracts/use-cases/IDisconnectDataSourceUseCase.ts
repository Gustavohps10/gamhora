import { AppError, Either } from '@pandhora/shared/helpers'

export interface DisconnectDataSourceInput {
  workspaceId: string
  connectionInstanceId: string
}

export interface IDisconnectDataSourceUseCase {
  execute(input: DisconnectDataSourceInput): Promise<Either<AppError, void>>
}

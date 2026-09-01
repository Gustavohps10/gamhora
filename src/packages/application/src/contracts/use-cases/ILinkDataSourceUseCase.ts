import { AppError, Either } from '@mr-tick/shared/helpers'

import { WorkspaceDTO } from '@/dtos'

export type LinkDataSourceInput = {
  workspaceId: string
  connectionInstanceId: string
  dataSourceId: string
}

export interface ILinkDataSourceUseCase {
  execute(input: LinkDataSourceInput): Promise<Either<AppError, WorkspaceDTO>>
}

import { AppError, Either } from '@mr-tick/shared/helpers'

import { WorkspaceDTO } from '@/dtos'

export type UnlinkDataSourceInput = {
  workspaceId: string
  connectionInstanceId?: string
}

export interface IUnlinkDataSourceUseCase {
  execute(input: UnlinkDataSourceInput): Promise<Either<AppError, WorkspaceDTO>>
}

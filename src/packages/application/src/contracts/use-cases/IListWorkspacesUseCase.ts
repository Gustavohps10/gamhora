import { AppError, Either } from '@pandhora/shared/helpers'

import { PagedResultDTO, WorkspaceDTO } from '@/dtos'

export interface IListWorkspacesUseCase {
  execute(): Promise<Either<AppError, PagedResultDTO<WorkspaceDTO>>>
}

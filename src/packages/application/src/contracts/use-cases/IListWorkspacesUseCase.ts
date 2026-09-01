import { AppError, Either } from '@mr-tick/shared/helpers'

import { PagedResultDTO, WorkspaceDTO } from '@/dtos'

export interface IListWorkspacesUseCase {
  execute(): Promise<Either<AppError, PagedResultDTO<WorkspaceDTO>>>
}

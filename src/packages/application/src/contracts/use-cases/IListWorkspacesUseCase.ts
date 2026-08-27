import { AppError, Either } from '@gamhora/shared/helpers'

import { PagedResultDTO, WorkspaceDTO } from '@/dtos'

export interface IListWorkspacesUseCase {
  execute(): Promise<Either<AppError, PagedResultDTO<WorkspaceDTO>>>
}

import { AppError, Either } from '@gamhora/shared/helpers'

export interface MarkWorkspaceAsConfiguredInput {
  workspaceId: string
}

export interface IMarkWorkspaceAsConfiguredUseCase {
  execute(
    input: MarkWorkspaceAsConfiguredInput,
  ): Promise<Either<AppError, void>>
}

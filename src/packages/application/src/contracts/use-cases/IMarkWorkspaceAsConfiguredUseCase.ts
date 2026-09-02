import { AppError, Either } from '@mr-tick/shared/helpers'

export interface MarkWorkspaceAsConfiguredInput {
  workspaceId: string
}

export interface IMarkWorkspaceAsConfiguredUseCase {
  execute(
    input: MarkWorkspaceAsConfiguredInput,
  ): Promise<Either<AppError, void>>
}

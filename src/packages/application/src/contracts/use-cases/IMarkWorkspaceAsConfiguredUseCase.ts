import { AppError, Either } from '@pandhora/shared/helpers'

export interface MarkWorkspaceAsConfiguredInput {
  workspaceId: string
}

export interface IMarkWorkspaceAsConfiguredUseCase {
  execute(
    input: MarkWorkspaceAsConfiguredInput,
  ): Promise<Either<AppError, void>>
}

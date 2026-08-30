import { AppError, Either } from '@pandhora/shared/helpers'

export type DeleteWorkspaceInput = {
  workspaceId: string
}

export interface IDeleteWorkspaceUseCase {
  execute(input: DeleteWorkspaceInput): Promise<Either<AppError, void>>
}

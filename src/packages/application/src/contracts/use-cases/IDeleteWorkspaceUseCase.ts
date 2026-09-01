import { AppError, Either } from '@mr-tick/shared/helpers'

export type DeleteWorkspaceInput = {
  workspaceId: string
}

export interface IDeleteWorkspaceUseCase {
  execute(input: DeleteWorkspaceInput): Promise<Either<AppError, void>>
}

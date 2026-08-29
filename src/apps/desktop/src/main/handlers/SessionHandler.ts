import { IGetCurrentUserUseCase } from '@pandhora/application'
import { MemberDTO } from '@pandhora/application'
import {
  AppError,
  createResponseViewModel,
  Either,
} from '@pandhora/shared/helpers'
import { IRequest } from '@pandhora/shared/transport'
import { MemberViewModel, ViewModel } from '@pandhora/shared/view-models'
import { IpcMainInvokeEvent } from 'electron'

import { HandlerBase } from '@/main/handlers/HandlerBase'

export interface GetCurrentUserRequest {
  workspaceId: string
  connectionInstanceId: string
}

export class SessionHandler implements HandlerBase<SessionHandler> {
  constructor(private readonly getCurrentUserService: IGetCurrentUserUseCase) {}

  public async getCurrentUser(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<GetCurrentUserRequest>,
  ): Promise<ViewModel<MemberViewModel>> {
    const result: Either<AppError, MemberDTO> =
      await this.getCurrentUserService.execute({
        workspaceId: body.workspaceId,
        connectionInstanceId: body.connectionInstanceId,
      })

    return createResponseViewModel(result)
  }
}

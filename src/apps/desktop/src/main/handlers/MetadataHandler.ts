import {
  IMetadataPullUseCase,
  MetadataDTO,
  PullMetadataInput,
} from '@pandhora/application'
import {
  AppError,
  createResponseViewModel,
  Either,
} from '@pandhora/shared/helpers'
import { IRequest } from '@pandhora/shared/transport'
import { MetadataViewModel, ViewModel } from '@pandhora/shared/view-models'

import { HandlerBase } from '@/main/handlers/HandlerBase'

export class MetadataHandler implements HandlerBase<MetadataHandler> {
  constructor(private readonly metadataPullService: IMetadataPullUseCase) {}

  public async pull(
    _event: Electron.IpcMainInvokeEvent,
    { body }: IRequest<PullMetadataInput>,
  ): Promise<ViewModel<MetadataViewModel>> {
    const result: Either<AppError, MetadataDTO> =
      await this.metadataPullService.execute(body)

    return createResponseViewModel(result)
  }
}

import { AppError, Either } from '@pandhora/shared/helpers'
import { IJobEvent } from '@pandhora/shared/transport'

import { FileData } from '@/contracts/infra'

export interface IImportAddonUseCase {
  execute(
    fileData: FileData,
    onProgress?: (event: IJobEvent) => void,
  ): Promise<Either<AppError, void>>
}

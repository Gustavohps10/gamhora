import { AppError, Either } from '@gamhora/shared/helpers'
import { IJobEvent } from '@gamhora/shared/transport'

import { FileData } from '@/contracts/infra'

export interface IImportAddonUseCase {
  execute(
    fileData: FileData,
    onProgress?: (event: IJobEvent) => void,
  ): Promise<Either<AppError, void>>
}

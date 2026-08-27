import { IHeadersAPI } from '@gamhora/application'
import { IHeaders } from '@gamhora/shared/transport'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const headersInvoker: IHeadersAPI = {
  setDefaultHeaders: (headers: IHeaders): void =>
    IpcInvoker.setDefaultHeaders(headers),
  getDefaultHeaders: (): IHeaders => IpcInvoker.getDefaultHeaders(),
}

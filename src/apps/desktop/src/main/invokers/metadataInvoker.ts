import { IMetadataAPI } from '@gamhora/application'

import { IpcInvoker } from '@/main/adapters/IpcInvoker'

export const metadataInvoker: IMetadataAPI = {
  pull: (payload) => IpcInvoker.invoke('METADATA_PULL', payload),
}

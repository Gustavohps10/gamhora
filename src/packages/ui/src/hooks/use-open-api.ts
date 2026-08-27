import { IOpenAPI } from '@gamhora/sdk'
import { useContext } from 'react'

import { OpenAPIContext } from '@/contexts/OpenAPIContext'

export function useOpenAPI(): IOpenAPI {
  const context = useContext(OpenAPIContext)
  if (!context) {
    throw new Error(
      'useOpenAPI() deve ser usado dentro de um <OpenAPIProvider>.',
    )
  }

  return context
}

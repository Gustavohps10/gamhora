import { IOpenAPI } from '@gamhora/application'
import React from 'react'
import { createContext } from 'react'

export const OpenAPIContext = createContext<IOpenAPI | null>(null)

interface OpenAPIProviderProps {
  client: IOpenAPI
  children: React.ReactNode
}

export function OpenAPIProvider({ client, children }: OpenAPIProviderProps) {
  console.log('CLIENT', client)
  return (
    <OpenAPIContext.Provider value={client}>{children}</OpenAPIContext.Provider>
  )
}

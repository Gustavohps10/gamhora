import { AddonContext } from './AddonContext'

export interface IAddon {
  id: string
  name: string
  version: string

  /**
   * Executado quando o host/core carrega o plugin.
   * O host injeta as capacidades disponíveis via contexto.
   */
  activate(context: AddonContext): Promise<void> | void

  /**
   * Limpeza de memória, remoção de listeners, etc.
   */
  deactivate?(): Promise<void> | void
}

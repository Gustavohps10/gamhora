import type {
  AddonContext,
  AddonSettingsSchema,
  AddonTheme,
  IAddon,
} from '@gamhora/sdk'

import { PURPLE_CSS } from './purpleCss.js'

export const PURPLE_THEME: AddonTheme = {
  id: 'purple-theme',
  name: 'Purple Neon',
  description:
    'Tema completo de cores e tipografia em tons violeta neon (100% de purple.css).',
  css: PURPLE_CSS,
}

export default class PurpleThemeAddon implements IAddon {
  private activeContext: AddonContext | null = null

  async getSettingsSchema(): Promise<AddonSettingsSchema> {
    return [
      {
        id: 'general',
        label: 'Geral',
        groups: [
          {
            id: 'theme_controls',
            label: 'Tema Purple Neon',
            description:
              'Aplique o arquivo CSS completo do Purple Neon com todas as variáveis, modo claro/escuro e estilos.',
            fields: [
              {
                id: 'apply-purple-theme',
                type: 'button',
                label: 'Ativar Tema Purple Neon',
                actionId: 'apply-theme',
              },
              {
                id: 'reset-theme',
                type: 'button',
                label: 'Restaurar Tema Padrão',
                variant: 'destructive',
                actionId: 'reset-theme',
              },
            ],
          },
        ],
      },
    ]
  }

  activate(context: AddonContext): void {
    this.activeContext = context
    context.themes.register(PURPLE_THEME)
    console.log(
      '🟣 [PurpleThemeAddon] Tema Purple Neon registrado com sucesso!',
    )
  }

  deactivate(): void {
    if (this.activeContext) {
      this.activeContext.themes.unregister(PURPLE_THEME.id)
    }
  }

  async executeAction(actionId: string): Promise<unknown> {
    console.log('🟣 [PurpleThemeAddon] executeAction chamado com:', actionId)
    if (actionId === 'apply-theme') {
      await this.activeContext?.commands.execute('theme:set', PURPLE_THEME.id)
      return {
        isSuccess: true,
        display: {
          title: 'Tema Purple Neon Ativado!',
          message: 'Arquivo CSS completo Purple Neon aplicado com sucesso.',
        },
      }
    }

    if (actionId === 'reset-theme') {
      await this.activeContext?.commands.execute('theme:set', null)
      return {
        isSuccess: true,
        display: {
          title: 'Tema Padrão Restaurado!',
          message: 'A interface retornou ao estilo nativo do Gamhora.',
        },
      }
    }

    return { isSuccess: false, error: 'Ação desconhecida' }
  }
}

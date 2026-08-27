import type {
  AddonContext,
  AddonSettingsSchema,
  AddonTheme,
  IAddon,
} from '@gamhora/sdk'

import { SUPABASE_CSS } from './supabaseCss.js'

export const SUPABASE_THEME: AddonTheme = {
  id: 'supabase-theme',
  name: 'Supabase Emerald',
  description:
    'Tema completo de cores e tipografia inspirado no Supabase (100% de supabase.css).',
  css: SUPABASE_CSS,
}

export default class SupabaseThemeAddon implements IAddon {
  private activeContext: AddonContext | null = null

  async getSettingsSchema(): Promise<AddonSettingsSchema> {
    return [
      {
        id: 'general',
        label: 'Geral',
        groups: [
          {
            id: 'theme_controls',
            label: 'Tema Supabase Emerald',
            description:
              'Aplique o arquivo CSS completo do Supabase com todas as variáveis, modo claro/escuro e estilos.',
            fields: [
              {
                id: 'apply-supabase-theme',
                type: 'button',
                label: 'Ativar Tema Supabase',
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
    context.themes.register(SUPABASE_THEME)
    console.log('🟢 [SupabaseThemeAddon] Tema Supabase registrado com sucesso!')
  }

  deactivate(): void {
    if (this.activeContext) {
      this.activeContext.themes.unregister(SUPABASE_THEME.id)
    }
  }

  async executeAction(actionId: string): Promise<unknown> {
    console.log('🟢 [SupabaseThemeAddon] executeAction chamado com:', actionId)
    if (actionId === 'apply-theme') {
      await this.activeContext?.commands.execute('theme:set', SUPABASE_THEME.id)
      return {
        isSuccess: true,
        display: {
          title: 'Tema Supabase Ativado!',
          message: 'Arquivo CSS completo do Supabase aplicado com sucesso.',
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

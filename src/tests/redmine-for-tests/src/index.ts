import { AddonContext, AddonSettingsSchema, IAddon } from '@metric-org/sdk'

import { redmineSettingsSchema } from './configFields'
import { RedmineDataSource } from './RedmineDataSource'

export default class Redmine4TestAddon implements IAddon {
  public metadata = {
    name: 'Redmine',
    iconUrl:
      'https://raw.githubusercontent.com/Gustavohps10/redmine-plugin/main/src/icon.png',
  }
  private dataSource = new RedmineDataSource()

  async getSettingsSchema(): Promise<AddonSettingsSchema> {
    return redmineSettingsSchema
  }

  activate(context: AddonContext): void {
    // 1. Registra capacidade de DataSource
    context.dataSources.register(this.dataSource)

    // 2. Registra Menus na Sidebar (Itens e Subitens de navegação)
    context.menus.sidebar.register({
      id: 'redmine-sidebar',
      label: 'Redmine',
      icon: 'Layers',
      children: [
        {
          id: 'redmine-issues',
          label: 'Minhas Tarefas',
          href: '/addons/redmine/issues',
          icon: 'ListTodo',
        },
        {
          id: 'redmine-projects',
          label: 'Projetos',
          href: '/addons/redmine/projects',
          icon: 'FolderGit2',
        },
      ],
    })

    // 3. Registra 1 único item de Popover na Timerbar (usando ícone PNG do Redmine)
    context.menus.timerbar.register({
      id: 'redmine-timerbar-popover',
      type: 'popover',
      icon: 'https://raw.githubusercontent.com/Gustavohps10/redmine-plugin/main/src/icon.png',
      tooltip: 'Redmine (Integração)',
      items: [
        {
          id: 'redmine:open-current-issue',
          label: 'Abrir Tarefa no Navegador',
          icon: 'ExternalLink',
          shortcut: 'Ctrl+Shift+O',
        },
        {
          id: 'redmine:generate-fake-meeting',
          label: 'Gerar Reunião Fake (Sugestão)',
          icon: 'Sparkles',
        },
        {
          id: 'redmine:force-full-sync',
          label: 'Forçar Carga Completa',
          icon: 'DownloadCloud',
        },
      ],
    })

    // 4. Registra os handlers dos comandos declarados
    context.commands.register('redmine:open-current-issue', async () => {
      console.log('🔴 [Redmine4Test] [Comando] Abrindo tarefa no navegador...')
      return { status: 'success', url: 'https://redmine.org/issues/123' }
    })

    context.commands.register('redmine:generate-fake-meeting', async () => {
      console.log('🔴 [Redmine4Test] Gerando sugestão fake de reunião...')
      await context.timeEntries.createSuggestion({
        taskId: '',
        comments: 'Alinhamento Redmine - Sprint Review (30 min)',
        timeSpentSeconds: 1800,
        source: 'addon',
      })
      await context.notifications.success(
        'Sugestão "Alinhamento Redmine - Sprint Review" gerada!',
        '🔴 Redmine Plugin',
      )
      return { status: 'success' }
    })

    context.commands.register('redmine:force-full-sync', async () => {
      console.log(
        '🔴 [Redmine4Test] [Comando] Sincronização completa iniciada...',
      )
      return { status: 'success', syncedCount: 42 }
    })
  }

  deactivate(): void {
    console.log('🔴 [Redmine4TestAddon] Desativando addon Redmine.')
  }
}

import { AddonContext, IAddon } from '@metric-org/sdk'

export default class FakeWatcherAddon implements IAddon {
  private intervalId: NodeJS.Timeout | null = null

  activate(context: AddonContext): void {
    console.log(
      '👁️ [FakeWatcherAddon] Ativando Fake Watcher Addon (Simulação)...',
    )

    // 1. Escuta eventos do sistema (Automações)
    context.events.onTimerStart((payload) => {
      console.log(
        `⚡ [FakeWatcherAddon] EVENTO: timer:start - Trabalhando na tarefa #${payload.taskId || 'sem tarefa'} no Workspace ${payload.workspaceId || 'N/A'}`,
      )
    })

    context.events.onTimerPause((payload) => {
      console.log(
        `⚡ [FakeWatcherAddon] EVENTO: timer:pause - Pausado no segundo ${payload.currentSeconds} (Workspace ${payload.workspaceId || 'N/A'})`,
      )
    })

    context.events.onTimerResume((payload) => {
      console.log(
        `⚡ [FakeWatcherAddon] EVENTO: timer:resume - Retomado no segundo ${payload.currentSeconds} (Workspace ${payload.workspaceId || 'N/A'})`,
      )
    })

    context.events.onTimerStop((payload) => {
      console.log(
        `⚡ [FakeWatcherAddon] EVENTO: timer:stop - Finalizado no segundo ${payload.currentSeconds} (Workspace ${payload.workspaceId || 'N/A'})`,
      )
    })

    context.events.onTimerUpdate((payload) => {
      console.log(
        `⚡ [FakeWatcherAddon] EVENTO: timer:update - Tarefa alterada para: ${payload.taskName || payload.comments || 'N/A'}`,
      )
    })

    // 2. Simula um Watcher em execução contínua
    console.log('👁️ [FakeWatcherAddon] Watcher de chamadas e atividades ativo.')

    // Gera uma sugestão inicial simulada ao iniciar o addon (após 4 segundos)
    setTimeout(async () => {
      try {
        await context.timeEntries.createSuggestion({
          taskId: '',
          comments: 'Reunião Discord - Daily Dev (Watcher Simulado)',
          timeSpentSeconds: 1800, // 30 min
          source: 'ai_suggestion',
        })
        await context.notifications.info(
          'Nova sugestão capturada: "Reunião Discord - Daily Dev" (30 min)',
          '👁️ Watcher Simulado',
        )
      } catch (err) {
        console.error('❌ [FakeWatcherAddon] Erro ao criar sugestão:', err)
      }
    }, 4000)

    // 3. Registra comandos e botões na Timerbar para testes interativos
    context.menus.timerbar.register({
      id: 'fake-watcher-popover',
      type: 'popover',
      icon: 'Eye',
      tooltip: 'Fake Watcher & Automations (Testes)',
      items: [
        {
          id: 'fake-watcher:sim-call',
          label: 'Simular Fim de Reunião (45 min)',
          icon: 'Video',
        },
        {
          id: 'fake-watcher:log-active',
          label: 'Imprimir Atividade no Console',
          icon: 'Terminal',
        },
      ],
    })

    context.commands.register('fake-watcher:sim-call', async () => {
      console.log(
        '👁️ [FakeWatcherAddon] Simulação: Reunião encerrada. Enviando sugestão...',
      )
      await context.timeEntries.createSuggestion({
        taskId: '',
        comments: 'Reunião Discord - Alinhamento Técnico (45 min)',
        timeSpentSeconds: 2700, // 45 min
        source: 'ai_suggestion',
      })
      await context.notifications.success(
        'Sugestão "Reunião Discord - Alinhamento Técnico" enviada com sucesso!',
        '👁️ Watcher Simulado',
      )
      return { status: 'success' }
    })

    context.commands.register('fake-watcher:log-active', async () => {
      const activeMsg = 'Trabalhando na tarefa #PROJ-101 (Refatoração de UI)'
      console.log(`⚡ [FakeWatcherAddon] Status em tempo real: ${activeMsg}`)
      await context.notifications.info(activeMsg, '👁️ Fake Watcher Log')
      return { status: 'success' }
    })
  }

  deactivate(): void {
    console.log('👁️ [FakeWatcherAddon] Desativando Fake Watcher Addon...')
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

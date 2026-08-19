import { AddonContext, IAddon } from '@metric-org/sdk'

export default class MetricAI4TestAddon implements IAddon {
  activate(context: AddonContext): void {
    console.log('🤖 [MetricAI4TestAddon] Ativando addon de testes de IA...')

    context.menus.timerbar.register({
      id: 'metric-ai-timerbar-popover',
      type: 'popover',
      icon: 'Sparkles',
      tooltip: 'Metric AI (OCR & Processamento)',
      items: [
        {
          id: 'metric-ai:ocr-tesseract',
          label: 'Executar OCR (Tesseract)',
          icon: 'ScanText',
          shortcut: 'Ctrl+Shift+O',
        },
        {
          id: 'metric-ai:analyze-screen',
          label: 'Analisar Atividade Visual',
          icon: 'Eye',
          shortcut: 'Ctrl+Shift+V',
        },
        {
          id: 'metric-ai:auto-categorize',
          label: 'Sugerir Categoria por IA',
          icon: 'Brain',
        },
      ],
    })

    context.commands.register('metric-ai:ocr-tesseract', async () => {
      console.log('DISPARADO OCR TESSERACT')
      await context.notifications.loading(
        '📷 Capturando imagem da tela...',
        'Metric AI - OCR',
      )
      console.log('APOS MENSAGEM')

      await new Promise((r) => setTimeout(r, 1000))

      await context.notifications.loading(
        '⚙️ Processando Engine Tesseract (Modelo LSTM)...',
        'Metric AI - OCR',
      )

      await new Promise((r) => setTimeout(r, 1200))

      await context.notifications.success(
        'Texto extraído: "PR #142: Refatoração do SDK de Addons"',
        '✅ OCR Concluído',
      )

      return {
        status: 'success',
        text: 'PR #142: Refatoração do SDK de Addons',
      }
    })

    context.commands.register('metric-ai:analyze-screen', async () => {
      await context.notifications.loading(
        '🔍 Analisando hierarquia de janelas...',
        'Metric AI - Visão Computacional',
      )

      await new Promise((r) => setTimeout(r, 1000))

      await context.notifications.loading(
        '🧠 Modelo ResNet-50 identificando aplicativo...',
        'Metric AI - Visão Computacional',
      )

      await new Promise((r) => setTimeout(r, 1000))

      await context.notifications.info(
        'Aplicação identificada: VS Code em foco por 42 min',
        '🎯 Análise Concluída',
      )

      return {
        status: 'success',
        app: 'VS Code',
      }
    })

    context.commands.register('metric-ai:auto-categorize', async () => {
      await context.notifications.loading(
        '📊 Consultando vetores e embeddings de tarefas...',
        'Metric AI - Categorização',
      )

      await new Promise((r) => setTimeout(r, 800))

      await context.notifications.success(
        'Sugestão: "Engenharia / Desenvolvimento"',
        '🎯 Categoria Definida',
      )

      return {
        status: 'success',
        suggestedCategory: 'Engenharia / Desenvolvimento',
      }
    })
  }

  deactivate(): void {
    console.log('🤖 [MetricAI4TestAddon] Desativando addon de testes de IA.')
  }
}

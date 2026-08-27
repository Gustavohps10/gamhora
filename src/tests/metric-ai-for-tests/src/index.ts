import { AddonContext, IAddon } from '@gamhora/sdk'

export default class GamhoraAI4TestAddon implements IAddon {
  public metadata = {
    name: 'Gamhora AI',
    iconUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%238B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  }
  activate(context: AddonContext): void {
    console.log('🤖 [GamhoraAI4TestAddon] Ativando addon de testes de IA...')

    context.menus.timerbar.register({
      id: 'gamhora-ai-timerbar-popover',
      type: 'popover',
      icon: 'Sparkles',
      tooltip: 'Gamhora AI (OCR & Processamento)',
      items: [
        {
          id: 'gamhora-ai:ocr-tesseract',
          label: 'Executar OCR (Tesseract)',
          icon: 'ScanText',
          shortcut: 'Ctrl+Shift+O',
        },
        {
          id: 'gamhora-ai:analyze-screen',
          label: 'Analisar Atividade Visual',
          icon: 'Eye',
          shortcut: 'Ctrl+Shift+V',
        },
        {
          id: 'gamhora-ai:auto-categorize',
          label: 'Sugerir Categoria por IA',
          icon: 'Brain',
        },
      ],
    })

    context.commands.register('gamhora-ai:ocr-tesseract', async () => {
      console.log('DISPARADO OCR TESSERACT')
      await context.notifications.loading(
        '📷 Capturando imagem da tela...',
        'Gamhora AI - OCR',
      )
      console.log('APOS MENSAGEM')

      await new Promise((r) => setTimeout(r, 1000))

      await context.notifications.loading(
        '⚙️ Processando Engine Tesseract (Modelo LSTM)...',
        'Gamhora AI - OCR',
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

    context.commands.register('gamhora-ai:analyze-screen', async () => {
      await context.notifications.loading(
        '🔍 Analisando hierarquia de janelas...',
        'Gamhora AI - Visão Computacional',
      )

      await new Promise((r) => setTimeout(r, 1000))

      await context.notifications.loading(
        '🧠 Modelo ResNet-50 identificando aplicativo...',
        'Gamhora AI - Visão Computacional',
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

    context.commands.register('gamhora-ai:auto-categorize', async () => {
      await context.notifications.loading(
        '📊 Consultando vetores e embeddings de tarefas...',
        'Gamhora AI - Categorização',
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
    console.log('🤖 [GamhoraAI4TestAddon] Desativando addon de testes de IA.')
  }
}

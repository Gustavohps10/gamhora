# METRIC — Arquitetura de Extensibilidade e Plugins (Addons)

Este documento consolida a arquitetura oficial de extensibilidade do **METRIC**, definindo os **4 Pilares Principais de Addons**, o ciclo de vida e a integração nativa com o **`@metric-org/sdk`**.

---

## 1. Visão Geral da Arquitetura

O METRIC opera com uma arquitetura **Local-First** desacoplada. Os plugins são organizados estritamente em torno de **4 Pilares Principais**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           METRIC CORE (RxDB)                            │
│  • Gerenciador de Apontamentos (Time Entries)                           │
│  • Motor de Sugestões de Apontamento (Timeline)                         │
│  • Timer Runtime (Ao vivo, Pausado, Sincronizado)                       │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   DataSources    │       │     Watchers     │       │    Calendars     │
│ (Jira, Redmine)  │       │ (Discord, Git)   │       │ (Google, Outlook)│
│ Puxa tarefas e   │       │ Monitora o PC e  │       │ Traz reuniões do │
│ envia log.       │       │ gera sugestões.  │       │ dia p/ virar log.│
└──────────────────┘       └──────────────────┘       └──────────────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │      Punch       │
                           │(Pontomais, Ahgora│
                           │ Bate ponto formal│
                           └──────────────────┘
```

---

## 2. Os 4 Pilares de Addons

### A. 📦 DataSources (Fontes de Dados & Tarefas)
* **Objetivo**: Conecta o Metric às plataformas oficiais de gestão de projetos.
* **Exemplos**: Jira, Redmine, YouTrack, GitHub Issues, Trello, Linear.
* **Responsabilidades**:
  - Listar e buscar tarefas atribuídas ao usuário no workspace ativo (`fetchTasks`).
  - Sincronizar e enviar os apontamentos de horas concluídos no Metric (`logTime`).

---

### B. 👁️ Watchers (Monitoramento & Sugestões)
* **Objetivo**: Observadores em segundo plano que monitoram o ambiente de trabalho do usuário ou escutam eventos nativos (`context.events`) para sugerir blocos de tempo ou atualizar status de presença externamente.
* **Exemplos**:
  - **Discord Voice**: Detecta saída de chamadas de voz e gera sugestão de tempo.
  - **Discord Rich Presence**: Atualiza o status do Discord quando o timer do Metric inicia ou pausa.
  - **Git & IDE Watcher**: Detecta tempo ativo em repositórios locais ou no VS Code.
* **Responsabilidades**:
  - Escutar eventos locais ou do sistema (`timer:start`, `timer:stop`, `system:idle`).
  - Emitir sugestões de apontamento com 1 clique para a timeline do usuário.

---

### C. 📅 Calendars (Agendas & Reuniões)
* **Objetivo**: Integração com agendas corporativas para exibir os compromissos do dia e permitir transformar reuniões em logs de tempo com 1 clique.
* **Exemplos**: Google Calendar, Microsoft Outlook Calendar, Cal.com.
* **Responsabilidades**:
  - Importar reuniões e eventos agendados para o dia (`fetchTodayEvents`).
  - Permitir conversão rápida de eventos da agenda em apontamentos vinculados a tarefas.

---

### D. ⏱️ Punch (Ponto Eletrônico & Jornada)
* **Objetivo**: Integração com sistemas formais de bate-ponto corporativo para conferência de jornada de trabalho vs horas dedicadas a tarefas.
* **Exemplos**: Pontomais, Secullum, Ahgora, Tangerino.
* **Responsabilidades**:
  - Executar batidas de ponto (Entrada, Almoço, Volta, Saída).
  - Consultar saldo de jornada e espelho de ponto para prevenção de divergências.

---

## 3. Manifesto e Configurações Dinâmicas (`settingsFields`)

Cada Addon declara suas opções de preferência no atributo `settingsFields`. O Metric renderiza automaticamente o formulário de configurações do addon na interface do aplicativo Desktop:

```typescript
import type { IAddon, AddonContext, AddonSettingsField } from '@metric-org/sdk'

export default class MeuAddon implements IAddon {
  public id = 'meu-addon'
  public name = 'Meu Addon'
  public version = '1.0.0'

  public settingsFields: AddonSettingsField[] = [
    {
      key: 'apiKey',
      label: 'Chave de API',
      type: 'text',
      required: true,
    },
    {
      key: 'autoSync',
      label: 'Sincronização Automática',
      type: 'boolean',
      defaultValue: true,
    },
  ]

  public async onActivate(context: AddonContext): Promise<void> {
    // Acesso ao banco do workspace
    const apiKey = await context.storage.get('apiKey')

    // Escutando eventos nativos do timer
    context.events.onTimerStart((payload) => {
      console.log('Timer iniciado para a tarefa:', payload.taskId)
    })
  }

  public async onDeactivate(): Promise<void> {
    // Limpeza de timers ou sockets
  }
}
```

---

## 4. Tabela Resumo dos Pilares

┌─────────────────┬──────────────────────────────────────────────────────────────────┐
│ Pilar           │ O que faz no METRIC?                                             │
├─────────────────┼──────────────────────────────────────────────────────────────────┤
│ **DataSources** │ Puxa tarefas de plataformas externas e envia os logs de tempo.   │
│ **Watchers**    │ Monitora apps/eventos e sugere blocos de tempo na timeline.     │
│ **Calendars**   │ Traz reuniões do dia da agenda e converte em apontamentos.      │
│ **Punch**       │ Registra o ponto eletrônico e verifica o saldo de jornada.       │
└─────────────────┴──────────────────────────────────────────────────────────────────┘

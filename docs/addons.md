# METRIC — Arquitetura de Extensibilidade e Plugins

Este documento consolida a arquitetura de extensibilidade do **METRIC**, definindo o modelo de **Addons**, as **Categorias Principais** de integração, a classificação por **Ambiente de Execução (Runtime)** e como cada elemento se integra ao núcleo do sistema (RxDB, Timer e Telas).

---

## 1. Visão Geral da Arquitetura

O METRIC opera com uma arquitetura **Local-First** (baseada em RxDB no Desktop e APIs no Backend). Para manter o sistema desacoplado, extensível e seguro, os plugins são organizados em torno de três conceitos fundamentais:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           METRIC CORE (RxDB)                            │
│  • Gerenciador de Apontamentos (Time Entries)                           │
│  • Motor de Sugestões (isSuggestion / timeStatus: 'suggestion')         │
│  • Timer Runtime (Ao vivo, Pausado, Sincronizado)                       │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   DataSources    │       │     Watchers     │       │    Calendars     │
│ (Jira, Redmine)  │       │ (Discord, Git)   │       │ (Google, Outlook)│
│  Fornece Tarefas │       │  Gera Sugestões  │       │ Reuniões do Dia  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

1. **Tarefas & Destinos**: Vêm dos **DataSources** (Jira, Redmine, YouTrack, etc.).
2. **Contexto & Sugestões**: Vêm dos **Watchers** (Discord, Git, IDEs) e **Calendars** (Google/Outlook).
3. **Unificação na UI**: O usuário vê as sugestões capturadas na tabela do dia e pode vinculá-las a uma tarefa do DataSource com 1 clique.

---

## 2. Classificação por Ambiente de Execução (Runtime)

Nem todo plugin pode rodar em qualquer lugar. O manifesto de cada plugin declara explicitamente seu `runtime`:

| Runtime | Onde Roda | Características | Exemplos |
| :--- | :--- | :--- | :--- |
| **`desktop`** | Processo Node.js / Electron Local | Tem acesso a sockets locais (IPC), janelas do SO, áudio, processos e hardware. | Discord Voice, Git Local Watcher, IDE Watcher, Automação de Idle |
| **`server`** | API Express / Backend Cloud | Baseado em chamadas HTTP REST, Webhooks e agendamentos cron em segundo plano. | Redmine, Jira, YouTrack, Clockify, Pontomais |
| **`hybrid`** | Ambos (Desktop + Server) | Possui parte rodando no servidor (ex: sync de dados) e parte local (ex: atalhos de sistema). | Google Calendar (OAuth no server + alertas locais) |

---

## 3. Categorias Principais de Plugins

Eliminando complexidades desnecessárias, o ecossistema do METRIC se divide em **6 categorias práticas**:

### A. 📦 Data Sources (Fontes de Dados & Gestão de Tarefas)
* **Objetivo**: Onde o trabalho oficial vive. Gerencia a sincronização de tarefas, projetos, membros e o envio final dos apontamentos de horas.
* **Exemplos**: Jira, Redmine, YouTrack, GitHub Projects, Linear, Azure DevOps, Clockify.
* **Runtime típico**: `server` (ou `desktop`).
* **Responsabilidades**:
  - Listar e filtrar tarefas atribuídas ao usuário.
  - Sincronização bidirecional de apontamentos (`SyncTimeEntry`).
  - Buscar metadados (atividades como *Dev*, *Review*, *Meeting*).

---

### B. 👁️ Activity Watchers (Observadores de Atividade & Sugestões)
* **Objetivo**: Observadores passivos que monitoram ferramentas locais em segundo plano e geram **sugestões automáticas de apontamentos** (`timeStatus: 'suggestion'`) para o usuário não perder tempo preenchendo logs manualmente.
* **Exemplos**:
  - **Discord Voice**: Detecta quando o usuário entra e sai de uma sala de voz/reunião e sugere o bloco de tempo correspondente.
  - **Git Watcher**: Detecta commits/branches locais trabalhadas.
  - **IDE Tracker**: Detecta tempo ativo no VS Code ou JetBrains.
* **Runtime típico**: `desktop` (100% local).
* **Responsabilidades**:
  - Escutar eventos do sistema operacional ou de apps locais.
  - Emitir payloads de sugestão para a fila do METRIC (`openAPI.suggestions.create(...)`).

---

### C. 📅 Calendars & Meetings (Agendas & Reuniões)
* **Objetivo**: Conecta a agendas corporativas para exibir a grade de compromissos do dia e permitir a conversão direta de reuniões em apontamentos.
* **Exemplos**: Google Calendar, Outlook Calendar, Microsoft Teams.
* **Runtime típico**: `server` (OAuth) ou `hybrid`.
* **Responsabilidades**:
  - Importar eventos e horários da agenda.
  - Sugerir apontamentos automáticos para reuniões concluídas.

---

### D. ⏱️ Time Clock (Ponto Eletrônico & Jornada)
* **Objetivo**: Integração com sistemas de controle de ponto formal da empresa para comparação entre "Horas Apontadas em Tarefas" vs "Horas Trabalhadas no Ponto".
* **Exemplos**: Pontomais, myAhgora, Tangerino, Secullum.
* **Runtime típico**: `server` ou `desktop`.
* **Responsabilidades**:
  - Executar batidas de ponto (Entrada, Almoço, Volta, Saída).
  - Obter saldo do dia e espelho de ponto para validação de divergências.

---

### E. ⚡ Automations & Presence (Automações & Status)
* **Objetivo**: Reage aos eventos do ciclo de vida do timer do METRIC para acionar automações e atualizar o status do usuário em outras ferramentas.
* **Exemplos**:
  - Atualizar **Discord Rich Presence** (*"Desenvolvendo #PROJ-42"*).
  - Alterar status do **Slack / Teams** para *"Em Foco / Ocupado"* quando o timer iniciar.
  - Pausar o timer automaticamente quando o computador entrar em **Idle (Ausente)**.
* **Runtime típico**: `desktop` ou `server`.
* **Gatilhos (Triggers)**:
  - `timer:start`, `timer:pause`, `timer:resume`, `timer:stop`, `system:idle`.

---

### F. 🛠️ Utilities (Utilitários & Ações Rápidas)
* **Objetivo**: Ações e atalhos disponibilizados em menus de contexto, command palette ou cabeçalhos.
* **Exemplos**:
  - Exportar apontamentos do dia/semana para PDF ou CSV.
  - Gerar resumo das atividades do dia usando IA (ex: para mandar na daily).
  - Ações rápidas de navegação (ex: *"Abrir tarefa no navegador"*).
* **Runtime típico**: `desktop` ou `server`.

---

## 4. Estrutura do Manifesto (`addon.json`)

Cada plugin possui um manifesto declarativo que descreve suas capacidades, categorias e runtime:

```json
{
  "id": "metric-plugin-discord",
  "name": "Discord Meeting Watcher",
  "version": "1.0.0",
  "displayName": "Discord (Reuniões de Voz)",
  "description": "Captura automaticamente o tempo gasto em canais de voz do Discord e gera sugestões de apontamento.",
  "runtime": "desktop",
  "categories": ["watchers", "automations"],
  "capabilities": {
    "activityWatcher": true,
    "presence": true
  },
  "configFields": {
    "configuration": [
      {
        "id": "minCallDurationSeconds",
        "label": "Duração mínima para sugerir apontamento (segundos)",
        "type": "number",
        "defaultValue": 60
      }
    ]
  }
}
```

---

## 5. Ciclo de Vida do Plugin

Todo Addon implementa a interface padrão de ciclo de vida:

```typescript
export interface IMetricAddon {
  readonly id: string
  readonly name: string
  readonly version: string

  /**
   * Chamado quando o plugin é carregado e inicializado no host (Desktop ou Server).
   * Recebe o contexto com as APIs disponíveis para registrar seus serviços.
   */
  activate(context: AddonContext): Promise<void> | void

  /**
   * Chamado ao desativar ou desinstalar o plugin.
   * Responsável por cancelar listeners, conexões de socket e timers.
   */
  deactivate?(): Promise<void> | void
}
```

### Exemplo de Registro Simplificado

```typescript
import { IMetricAddon, AddonContext } from '@metric-org/sdk'
import { DiscordVoiceWatcher } from './DiscordVoiceWatcher'
import { DiscordPresenceAutomation } from './DiscordPresenceAutomation'

export default class DiscordAddon implements IMetricAddon {
  readonly id = 'metric-plugin-discord'
  readonly name = 'Discord Integration'
  readonly version = '1.0.0'

  activate(context: AddonContext) {
    // Registra o observador de chamadas de voz (gera sugestões)
    context.watchers.register(new DiscordVoiceWatcher())

    // Registra a automação de Rich Presence (atualiza status ao rodar timer)
    context.automations.register(new DiscordPresenceAutomation())
  }

  deactivate() {
    // Libera conexões de socket IPC locais
  }
}
```

---

## 6. Resumo das Responsabilidades

```text
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Categoria               │ O que faz no METRIC?                                   │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ Data Sources            │ Puxa tarefas e envia as horas aprovadas.               │
│ Activity Watchers       │ Monitora apps locais e sugere blocos de tempo.         │
│ Calendars & Meetings    │ Mostra reuniões do dia e permite transformá-las em log.│
│ Time Clock              │ Bate ponto e compara com as horas de tarefas.          │
│ Automations & Presence  │ Reage ao timer (muda status no Slack, pausa em idle).  │
│ Utilities               │ Exporta relatórios, resumos com IA e atalhos de menu.  │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

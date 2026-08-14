# METRIC — Arquitetura de Extensibilidade e Plugins

Este documento consolida a arquitetura de extensibilidade do **METRIC**, definindo o modelo de **Addons Multi-Capacidade**, a estrutura de categorias da Interface de Usuário (UI) e o contrato técnico das APIs expostas pelo SDK.

---

# 1. Conceito Central: Addons Multi-Capacidade

No METRIC, um **Plugin (Addon)** é um pacote/contêiner. Ele não fica limitado a um único tipo de integração.

Um mesmo Addon pode implementar uma ou mais **Capabilities** do SDK simultaneamente.

## Exemplo

O Addon do Redmine pode implementar:

- `IDataSourceAPI` para sincronizar tarefas e apontamentos.
- `IWidgetAPI` para exibir dashboards e gráficos.
- `IMenuAPI` para adicionar ações como **Abrir no Navegador**.

Visualmente:

```text
┌─────────────────────────────────────────┐
│ Redmine Addon                           │
├─────────────────────────────────────────┤
│ ✔ IDataSourceAPI                        │
│ ✔ IWidgetAPI                            │
│ ✔ IMenuAPI                              │
└─────────────────────────────────────────┘
```

O Marketplace apresenta o Addon apenas uma vez, mas ele aparece nas categorias correspondentes às capacidades implementadas.

---

# 2. Categorias de Plugins na UI

No Marketplace e na tela de gerenciamento, os Addons são organizados por categorias amigáveis ao usuário.

Essas categorias **não representam tipos de plugins**, apenas uma forma de organização visual baseada nas APIs implementadas.

| Categoria           | Objetivo                                         | APIs Relacionadas                     |
| ------------------- | ------------------------------------------------ | ------------------------------------- |
| Fontes de Dados     | Integrações com ferramentas de gestão de tarefas | `IDataSourceAPI`                      |
| Ponto & Jornada     | Registro de ponto eletrônico                     | `ITimeClockAPI`                       |
| Intervalos & Agenda | Calendário, reuniões e blocos de tempo           | `IIntervalsAPI`                       |
| Widgets & Analytics | Dashboards, cards e widgets                      | `IWidgetAPI`                          |
| Automações          | Eventos, triggers e notificações                 | `IAutomationsAPI`, `INotificationAPI` |
| Utilitários         | Menus, ações rápidas e ferramentas               | `IMenuAPI`                            |
| Temas               | Personalização visual                            | `IThemeAPI`                           |

---

# 3. APIs do SDK

Cada capacidade do sistema é representada por uma interface.

Um Addon implementa apenas as APIs necessárias.

---

## IDataSourceAPI

### Objetivo

Integração bidirecional com sistemas de gerenciamento de tarefas.

### Exemplos

- Jira
- Redmine
- YouTrack
- Trello
- Azure DevOps
- GitHub Projects

### Responsabilidades

- Importar projetos
- Importar tarefas
- Importar usuários
- Enviar apontamentos de tempo
- Sincronização incremental
- Autenticação

---

## ITimeClockAPI

### Objetivo

Integração com sistemas de ponto eletrônico.

### Exemplos

- myAhgora
- Pontomais
- Tangerino
- Secullum

### Operações

```ts
punch(type?)
```

Executa uma batida de ponto.

Tipos possíveis:

- CLOCK_IN
- LUNCH_START
- LUNCH_END
- CLOCK_OUT

```ts
getCurrentStatus()
```

Retorna o estado atual:

- WORKING
- ON_LUNCH
- OFF_WORK

```ts
getTodaySummary()
```

Retorna:

- batidas do dia
- horas trabalhadas
- saldo
- horas previstas

---

## IIntervalsAPI

### Objetivo

Consumir blocos de tempo provenientes de calendários.

### Exemplos

- Google Calendar
- Outlook
- Microsoft Teams

### Responsabilidades

- importar eventos
- mostrar reuniões na Timeline
- converter reunião em apontamento
- sugerir apontamentos automaticamente

---

## IWidgetAPI

### Objetivo

Adicionar componentes analíticos ao METRIC.

Os widgets são declarativos.

O desenvolvedor **não envia código React arbitrário**.

Em vez disso fornece:

- Schema JSON
- Fonte de dados
- Configuração visual

Isso garante:

- segurança
- compatibilidade
- consistência visual
- atualização automática pelo host

### Exemplos

- Burnup
- Burndown
- Horas por projeto
- Meta diária
- Timer flutuante (Always-on-Top)

---

## IMenuAPI

### Objetivo

Adicionar comandos e atalhos na interface.

### Locais possíveis

- Sidebar
- Menus de contexto
- Toolbar
- Modais
- Command Palette

### Exemplos

- Abrir tarefa no navegador
- Exportar PDF
- Gerar resumo com IA
- Melhorar texto
- Copiar URL

---

## IAutomationsAPI

### Objetivo

Motor de automações baseado em eventos.

### Modelo

```text
Trigger
    │
    ▼
 Action
```

### Gatilhos

- timer:start
- timer:stop
- system:idle
- system:resume
- interval:start
- interval:end
- timeClock:punch

### Casos de uso

- Atualizar Discord Rich Presence
- Pausar timer automaticamente
- Iniciar timer ao abrir determinada aplicação
- Executar Webhook
- Enviar mensagem ao Slack
- Gerar sugestão por IA

---

## INotificationAPI

### Objetivo

Emitir notificações.

### Tipos

- Notificação do sistema operacional
- Toast interno
- Badge
- Banner

### Exemplos

- reunião em 10 minutos
- meta diária não atingida
- timer parado há muito tempo
- divergência entre ponto e tarefas

---

## IThemeAPI

### Objetivo

Adicionar temas personalizados.

Pode incluir:

- Paleta de cores
- Tokens CSS
- Dark Mode
- Light Mode
- Ícones
- Fontes

---

# 4. Manifesto do Addon

Cada Addon possui um manifesto.

## Exemplo

```json
{
  "id": "metric-plugin-redmine",
  "name": "Redmine Integration",
  "version": "1.0.0",
  "categories": ["datasources", "widgets", "utilities"],
  "capabilities": {
    "dataSource": true,
    "widgets": true,
    "menu": true
  }
}
```

## Campos

| Campo        | Descrição                 |
| ------------ | ------------------------- |
| id           | Identificador único       |
| name         | Nome do Addon             |
| version      | Versão                    |
| categories   | Categorias exibidas na UI |
| capabilities | APIs implementadas        |

---

# 5. Ciclo de Vida

Todo Addon implementa a interface principal.

```ts
export interface IMetricAddon {
  id: string
  name: string
  version: string

  activate(context: AddonContext): Promise<void> | void

  deactivate?(): Promise<void> | void
}
```

## activate()

Executado quando o Addon é carregado.

Responsável por:

- registrar Data Sources
- registrar Widgets
- registrar Menus
- registrar Automações
- registrar Temas

## deactivate()

Chamado quando o Addon é descarregado.

Responsabilidades:

- remover listeners
- cancelar timers
- liberar recursos
- desconectar integrações

---

# 6. AddonContext

Durante a ativação o host entrega um contexto contendo todos os registries disponíveis.

```ts
export interface AddonContext {
  dataSources: IDataSourceRegistry
  timeClock: ITimeClockRegistry
  intervals: IIntervalsRegistry
  widgets: IWidgetRegistry
  menus: IMenuRegistry
  automations: IAutomationRegistry
  notifications: INotificationRegistry
  themes: IThemeRegistry
}
```

O Addon utiliza apenas os registries necessários.

Exemplo:

```ts
export default class RedmineAddon implements IMetricAddon {
  activate(context: AddonContext) {
    context.dataSources.register(new RedmineDataSource())

    context.widgets.register(new SprintBurnupWidget())

    context.menus.register(new OpenInBrowserAction())
  }
}
```

---

# 7. Fluxo Geral

```text
                Marketplace
                     │
                     ▼
             Instalação do Addon
                     │
                     ▼
            Leitura do manifest.json
                     │
                     ▼
          Descoberta das Capabilities
                     │
                     ▼
             activate(AddonContext)
                     │
       ┌─────────────┼──────────────┐
       ▼             ▼              ▼
 IDataSource     IWidgetAPI     IMenuAPI
       │             │              │
       └─────────────┼──────────────┘
                     ▼
             Funcionalidades
               disponíveis
```

---

# 8. Benefícios da Arquitetura

- Um único Addon pode implementar múltiplas funcionalidades.
- SDK modular e desacoplado.
- Marketplace organizado por categorias amigáveis.
- APIs independentes entre si.
- Registro declarativo de capacidades.
- Segurança ao impedir código arbitrário na UI.
- Facilidade para evolução do SDK sem quebrar Addons existentes.

---

# 9. Arquitetura de Distribuição e Execução Multi-Ambiente

O METRIC opera em três cenários distintos:

- **Desktop (Electron)** — Instalação local com suporte offline.
- **Web Self-Hosted (On-Premise)** — Instalação em servidor do cliente.
- **Web Cloud (SaaS Multi-Tenant)** — Ambiente Kubernetes com múltiplos Pods.

Para suportar todos esses cenários utilizando o mesmo SDK, a arquitetura desacopla completamente a **Origem do Addon (Repository)** da sua **Execução em Disco (Runtime Cache)**.

```text
┌─────────────────────────────────────────────────────────────┐
│                  IAddonRepository                           │
│ (GitHub Releases, GitLab, CDN Privada, S3, HTTP API)        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                  1. Download do pacote
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     IAddonCache                             │
│ Desktop → FileSystem                                        │
│ Cloud → /tmp/metric-cache                                  │
├─────────────────────────────────────────────────────────────┤
│ • Verifica cache                                            │
│ • Extrai sob demanda                                        │
│ • LRU automático                                            │
└─────────────────────────────┬───────────────────────────────┘
                              │
                  2. Retorna entrypoint JS
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Runtime                          │
├─────────────────────────────────────────────────────────────┤
│ const addon = await import(filePath)                        │
│ addon.activate(context)                                     │
└─────────────────────────────────────────────────────────────┘
```

---

# 10. Abstrações Principais do Runtime

## IAddonRepository

Responsável por localizar os pacotes em qualquer repositório.

```ts
export interface AddonPackageRef {
  publisher: string
  id: string
  version: string
  downloadUrl: string
}

export interface IAddonRepository {
  resolve(
    publisher: string,
    id: string,
    version: string,
  ): Promise<AddonPackageRef>
}
```

---

## IAddonCache

Responsável pelo cache físico do ambiente.

```ts
export interface IAddonCache {
  ensureExtracted(packageRef: AddonPackageRef): Promise<string>

  evict(publisher: string, id: string, version: string): Promise<void>
}
```

---

# 11. Estratégia Cloud Stateless (Kubernetes)

No ambiente Cloud, onde os Pods são efêmeros, adota-se uma arquitetura Stateless baseada na separação entre o **estado de instalação** e o **cache local de execução**.

## 1. Estado de Instalação vs. Disco Temporário

### Verdade (Banco / Redis)

O banco do METRIC armazena:

- plugins instalados
- versões
- permissões
- tenants

Essas informações sobrevivem ao reinício dos Pods.

### Cache Local do Pod

O diretório:

```text
/tmp/metric-cache/
```

existe apenas para permitir que o Node.js execute:

```ts
await import(filePath)
```

---

## 2. Fluxo com Lazy Loading

Quando uma requisição chega ao Pod:

1. O METRIC valida se o Tenant possui o plugin instalado.
2. O `IAddonCache` verifica se ele já está extraído.
3. Se existir:
   - executa imediatamente.
4. Caso contrário:
   - baixa o pacote;
   - extrai;
   - executa;
   - mantém em cache para próximas execuções.

---

## 3. Isolamento, Compartilhamento e Expurgo

### Pods Agnósticos

Os Pods não pertencem a um Tenant específico.

### Reutilização

Se vários Tenants utilizarem:

```text
redmine@2.0
```

o pacote será baixado apenas uma vez naquele Pod.

### Política LRU

O cache possui um limite (por exemplo, **1 GB**).

Ao atingir esse limite:

- plugins menos utilizados são removidos automaticamente;
- apenas o cache é apagado;
- o estado de instalação permanece no banco.

Essa estratégia mantém o ambiente Stateless, reduz o consumo de armazenamento e evita downloads repetitivos sem necessidade.

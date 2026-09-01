'use client'

import {
  AppRail,
  Header,
  TitleBar,
  UltimateTimeTracker,
} from '@mr-tick/ui/components'
import { useCurrentWidgetPosition } from '@mr-tick/ui/hooks'
import { queryClient } from '@mr-tick/ui/lib'
import { Metrics, TimeEntries } from '@mr-tick/ui/pages'
import {
  DataSourceConnectionsProvider,
  EnvironmentProvider,
  OpenAPIProvider,
  SidebarProvider,
  SyncProvider,
  TimeEntryProvider,
  TooltipProvider,
  WorkspaceProvider,
} from '@mr-tick/ui/providers'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  CalendarDays,
  ChartColumnBig,
  LayoutDashboard,
  ListTodo,
  Lock,
  Puzzle,
  Sparkles,
  Star,
  Timer,
  User,
  Users,
} from 'lucide-react'
import * as React from 'react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

// Mock environment for OpenAPI/RxDB fallback in web (injected as darwin for macOS traffic lights)
const mockEnvironment = { isDevelopment: false, platform: 'darwin' }

// Mock workspace data model with Jira and Redmine connections and user credentials
const mockWorkspace = {
  id: 'default',
  name: 'MR. TICK CORE WORKSPACE',
  description: 'Engineering Productivity Hub',
  isDefault: true,
  color: '#6366f1',
  avatarUrl: '',
  avatar: undefined,
  dataSourceConnections: [
    {
      id: 'conn-1',
      dataSourceId: 'redmine',
      status: 'connected',
      name: 'Redmine',
      member: {
        id: 'member-1',
        name: 'Gustavo Santos',
        login: 'gustavo.santos',
        avatarUrl: '',
      },
    },
    {
      id: 'conn-2',
      dataSourceId: 'jira',
      status: 'connected',
      name: 'Jira Software',
      member: {
        id: 'member-2',
        name: 'Gustavo Santos',
        login: 'gustavo@empresa.com',
        avatarUrl: '',
      },
    },
  ],
}

// Installed Addon Plugins list for DataSources
const mockInstalledPlugins = [
  {
    id: 'redmine',
    name: 'Redmine',
    version: '1.2.0',
    logo: '/ui/temp-plugins-icons/redmine.png',
    icon: 'redmine',
  },
  {
    id: 'jira',
    name: 'Jira Software',
    version: '2.4.1',
    logo: '/ui/temp-plugins-icons/jira.png',
    icon: 'jira',
  },
]

// Recursive Proxy to safely handle all nested openAPI/services/integrations/modules calls
function createOpenApiProxy(base: any = {}): any {
  const fallbackFn = (..._args: any[]) =>
    Promise.resolve({ isSuccess: true, data: [] })
  const target =
    typeof base === 'function'
      ? base
      : typeof base === 'object' && base !== null
        ? base
        : fallbackFn

  return new Proxy(target, {
    get(t, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined
      }
      if (prop === 'on' || prop === 'off' || prop === 'subscribe') {
        return () => () => {}
      }
      if (prop in t && t[prop] !== undefined) {
        if (typeof t[prop] === 'object' && t[prop] !== null) {
          return createOpenApiProxy(t[prop])
        }
        return t[prop]
      }
      return createOpenApiProxy(fallbackFn)
    },
    apply(t, thisArg, argArray) {
      if (typeof t === 'function' && t !== fallbackFn) {
        return t.apply(thisArg, argArray)
      }
      return Promise.resolve({ isSuccess: true, data: [] })
    },
  })
}

// Complete Mock OpenAPI Client simulating desktop backend
const mockOpenApiClient: any = createOpenApiProxy({
  services: {
    workspaces: {
      getById: async () => ({
        isSuccess: true,
        data: mockWorkspace,
      }),
      list: async () => ({
        isSuccess: true,
        data: [mockWorkspace],
      }),
      create: async () => ({ isSuccess: true, data: mockWorkspace }),
      updateIdentity: async () => ({ isSuccess: true, data: mockWorkspace }),
      remove: async () => ({ isSuccess: true }),
    },
    auth: {
      getCurrentUser: async () => ({
        isSuccess: true,
        data: {
          id: 'user-1',
          email: 'dev@mr-tick.io',
          name: 'Gustavo (Tech Lead)',
        },
      }),
      getOrganizations: async () => ({
        isSuccess: true,
        data: [],
      }),
    },
    datasources: {
      list: async () => ({
        isSuccess: true,
        data: [
          { id: 'redmine', name: 'Redmine' },
          { id: 'jira', name: 'Jira Software' },
        ],
      }),
      link: async () => ({ isSuccess: true }),
      unlink: async () => ({ isSuccess: true }),
      connect: async () => ({ isSuccess: true }),
      disconnect: async () => ({ isSuccess: true }),
    },
    addons: {
      list: async () => ({
        isSuccess: true,
        data: mockInstalledPlugins,
      }),
    },
  },
  integrations: {
    addons: {
      listInstalled: async () => ({
        isSuccess: true,
        data: mockInstalledPlugins,
      }),
      getSidebarMenus: async () => ({
        isSuccess: true,
        data: [],
      }),
      getTimerbarMenus: async () => ({
        isSuccess: true,
        data: [],
      }),
      list: async () => ({
        isSuccess: true,
        data: mockInstalledPlugins,
      }),
    },
  },
  modules: {
    system: {
      getEnvironment: async () => mockEnvironment,
      getAppVersion: async () => '0.1.1',
    },
    workspaces: {
      list: async () => [mockWorkspace],
      getActive: async () => mockWorkspace,
    },
    auth: {
      getCurrentUser: async () => ({
        id: 'user-1',
        email: 'dev@mr-tick.io',
        name: 'Gustavo',
      }),
    },
  },
  events: {
    on: () => () => {},
  },
})

// Custom Mock Sidebar strictly matching original desktop UI
function MockSidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'time-entries' | 'metrics'
  setActiveTab: (tab: 'time-entries' | 'metrics') => void
}) {
  const navigate = useNavigate()

  const handleTabClick = (tab: 'time-entries' | 'metrics') => {
    setActiveTab(tab)
    if (tab === 'time-entries') {
      navigate('/workspaces/default/time-entries')
    } else {
      navigate('/workspaces/default/my-metric')
    }
  }

  return (
    <aside className="border-border/60 bg-sidebar text-sidebar-foreground flex h-full w-52 shrink-0 flex-col justify-between border-r select-none">
      <div className="space-y-3 p-3">
        {/* Header com a logo oficial limpa */}
        <div className="border-border/40 flex items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo-icon.svg"
              alt="Mr. Tick"
              className="size-6 object-contain dark:invert"
            />
            <div className="flex flex-col leading-none">
              <img
                src="/logo-text.svg"
                alt="Mr. Tick"
                className="w-[72px] object-contain dark:invert"
              />
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[9px]">
                <span>Open Core</span>
                <span className="opacity-40">&middot;</span>
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="size-2 fill-current" /> 120
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grupos de Navegação */}
        <div className="space-y-3.5 font-mono text-xs">
          {/* 1. Controle Pessoal */}
          <div>
            <div className="text-muted-foreground/60 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              Controle Pessoal
            </div>
            <nav className="mt-1 space-y-0.5">
              <div className="text-muted-foreground/40 flex cursor-not-allowed items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <ListTodo className="size-3.5" />
                  <span>Minhas Tarefas</span>
                </span>
                <Lock className="size-3 opacity-60" />
              </div>

              <button
                onClick={() => handleTabClick('time-entries')}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors ${
                  activeTab === 'time-entries'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Timer className="size-3.5" />
                  <span>Meus Apontamentos</span>
                </span>
              </button>

              <button
                onClick={() => handleTabClick('metrics')}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors ${
                  activeTab === 'metrics'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ChartColumnBig className="size-3.5" />
                  <span>Métricas</span>
                </span>
              </button>

              <div className="text-muted-foreground/40 flex cursor-not-allowed items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" />
                  <span>Calendário</span>
                </span>
                <Lock className="size-3 opacity-60" />
              </div>
            </nav>
          </div>

          {/* 2. Gestão de Time (PRO) */}
          <div>
            <div className="text-muted-foreground/60 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              Gestão de Time
            </div>
            <nav className="mt-1 space-y-0.5">
              <div className="text-muted-foreground/50 flex items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="size-3.5" />
                  <span>Visão Geral</span>
                </span>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 text-[8px] font-bold text-amber-500">
                  PRO
                </span>
              </div>

              <div className="text-muted-foreground/50 flex items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Users className="size-3.5" />
                  <span>Membros</span>
                </span>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 text-[8px] font-bold text-amber-500">
                  PRO
                </span>
              </div>

              <div className="text-muted-foreground/50 flex items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5" />
                  <span>Insights IA</span>
                </span>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 text-[8px] font-bold text-amber-500">
                  PRO
                </span>
              </div>
            </nav>
          </div>

          {/* 3. Integrações */}
          <div>
            <div className="text-muted-foreground/60 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              Integrações
            </div>
            <nav className="mt-1 space-y-0.5">
              <div className="text-muted-foreground/70 hover:bg-sidebar-accent/50 flex cursor-pointer items-center justify-between rounded px-2 py-1.5">
                <span className="flex items-center gap-2">
                  <Puzzle className="size-3.5" />
                  <span>Addons</span>
                </span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t p-3 font-mono text-[11px]">
        <span className="flex items-center gap-1.5 truncate">
          <User className="size-3" />
          <span>Gustavo</span>
        </span>
        <span className="text-[10px] font-bold text-emerald-500">v0.1.1</span>
      </div>
    </aside>
  )
}

function MockDesktopShell() {
  const [activeTab, setActiveTab] = React.useState<'time-entries' | 'metrics'>(
    'time-entries',
  )
  const [widgetPosition] = useCurrentWidgetPosition()

  const titleInfo =
    activeTab === 'metrics'
      ? { title: 'Métricas Pessoais', icon: ChartColumnBig }
      : { title: 'Meus Apontamentos', icon: Timer }
  const TitleIcon = titleInfo.icon

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col overflow-hidden select-none">
      <TitleBar>
        <Header />
      </TitleBar>

      <main className="bg-background relative mt-1.5 flex min-h-0 w-full flex-1 overflow-hidden">
        {/* 1. AppRail Oficial na Extrema Esquerda */}
        <AppRail onNewWorkspaceClick={() => {}} />

        {/* 2. Seção Interna do Workspace com Borda Superior/Esquerda Arredondada */}
        <section className="border-border bg-background relative flex h-full min-h-0 flex-1 overflow-hidden rounded-tl-md border-t border-l">
          {/* Mock Sidebar Exclusiva da Landing Page */}
          <MockSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Layout Oficial: Barra Twenty Colada ao Topo + 4 Modos de Ancoragem da Timerbar */}
          <div className="bg-background flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            {/* Barra Twenty Colada ao Topo (ACIMA de toda a divisão da Timerbar) */}
            <div className="border-border/60 bg-background/95 z-20 flex h-9 shrink-0 items-center justify-between border-b px-4 backdrop-blur-sm select-none">
              <div className="flex items-center gap-2">
                <TitleIcon className="text-muted-foreground size-3.5" />
                <span className="text-foreground text-xs font-semibold tracking-tight">
                  {titleInfo.title}
                </span>
              </div>
            </div>

            {/* 1. TOPO */}
            {widgetPosition === 'top' && (
              <div
                data-widget-drag-boundary
                className="bg-background z-10 shrink-0 border-b px-2 py-2 shadow-sm"
              >
                <UltimateTimeTracker />
              </div>
            )}

            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* 2. ESQUERDA */}
              {widgetPosition === 'left' && (
                <div
                  data-widget-drag-boundary
                  className="bg-background z-10 flex h-full shrink-0 border-r shadow-sm"
                >
                  <UltimateTimeTracker />
                </div>
              )}

              {/* CENTRO: CONTEÚDO OFICIAL COM SCROLL REAL E SEM CORTE */}
              <div className="bg-muted/10 min-h-0 min-w-0 flex-1 overflow-y-auto p-4 pb-12">
                <Routes>
                  <Route
                    path="/workspaces/:workspaceId/time-entries"
                    element={<TimeEntries />}
                  />
                  <Route
                    path="/workspaces/:workspaceId/my-metric"
                    element={<Metrics />}
                  />
                  <Route path="*" element={<TimeEntries />} />
                </Routes>
              </div>

              {/* 3. DIREITA */}
              {widgetPosition === 'right' && (
                <div
                  data-widget-drag-boundary
                  className="bg-background z-10 flex h-full shrink-0 border-l shadow-sm"
                >
                  <UltimateTimeTracker />
                </div>
              )}
            </div>

            {/* 4. RODAPÉ */}
            {widgetPosition === 'bottom' && (
              <div
                data-widget-drag-boundary
                className="bg-background z-10 shrink-0 border-t px-2 py-2 shadow-sm"
              >
                <UltimateTimeTracker />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export function DesktopAppMockup() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border-border bg-card mx-auto mt-12 aspect-[16/9] w-full max-w-5xl animate-pulse rounded-xl border" />
    )
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-5xl text-left">
      {/* Moldura da Janela Desktop com Proporção 16:9 e Scroll Perfeito */}
      <div className="border-border bg-card text-foreground relative flex aspect-[16/9] w-full flex-col overflow-hidden rounded-xl border shadow-2xl transition-all">
        {/* Canvas do App com Proporção Desktop Nativa e Scroll Total */}
        <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <MemoryRouter initialEntries={['/workspaces/default/time-entries']}>
            <OpenAPIProvider client={mockOpenApiClient}>
              <EnvironmentProvider environment={mockEnvironment}>
                <QueryClientProvider client={queryClient}>
                  <WorkspaceProvider workspaceId="default">
                    <DataSourceConnectionsProvider>
                      <SyncProvider>
                        <TimeEntryProvider>
                          <TooltipProvider>
                            <SidebarProvider>
                              <MockDesktopShell />
                            </SidebarProvider>
                          </TooltipProvider>
                        </TimeEntryProvider>
                      </SyncProvider>
                    </DataSourceConnectionsProvider>
                  </WorkspaceProvider>
                </QueryClientProvider>
              </EnvironmentProvider>
            </OpenAPIProvider>
          </MemoryRouter>
        </div>
      </div>
    </div>
  )
}

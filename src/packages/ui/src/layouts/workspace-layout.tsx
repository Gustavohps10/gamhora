import {
  ChartColumnBig,
  LayoutDashboard,
  ListTodo,
  Puzzle,
  Timer,
} from 'lucide-react'
import { Outlet, useLocation, useParams } from 'react-router'

import {
  AppSidebar,
  AppSidebarContent,
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarWorkspacesContent,
  AppSidebarWorkspacesFooter,
} from '@/components'
import { AddonsManagerModal } from '@/components/addons-manager/addons-manager-modal'
import { AppSidebarDefaultHeader } from '@/components/app-sidebar/app-sidebar-default-header'
import { Footer } from '@/components/footer'
import { UltimateTimeTracker } from '@/components/time-bar/ultimate-entry-bar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataSourceConnectionsProvider } from '@/contexts/DataSourceConnectionsContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useCurrentWidgetPosition } from '@/hooks/use-timer-settings'
import { useAddonsModalStore } from '@/stores/addonsModalStore'
import { SyncProvider } from '@/stores/syncStore'
import { TimeEntryProvider } from '@/stores/timeEntryStore'

export function WorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [widgetPosition] = useCurrentWidgetPosition()
  const location = useLocation()
  const isAddonsModalOpen = useAddonsModalStore((s) => s.isOpen)
  const closeModal = useAddonsModalStore((s) => s.closeModal)

  const getPageInfo = () => {
    if (
      location.pathname.includes('my-metric') ||
      location.pathname.includes('metrics')
    ) {
      return { title: 'Métricas Pessoais', icon: ChartColumnBig }
    }
    if (location.pathname.includes('time-entries')) {
      return { title: 'Meus Apontamentos', icon: Timer }
    }
    if (location.pathname.includes('activities')) {
      return { title: 'Atividades', icon: ListTodo }
    }
    if (location.pathname.includes('addons')) {
      return { title: 'Addons', icon: Puzzle }
    }
    return { title: 'Workspace', icon: LayoutDashboard }
  }

  const pageInfo = getPageInfo()
  const PageIcon = pageInfo.icon

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <DataSourceConnectionsProvider>
        <SyncProvider>
          <TimeEntryProvider>
            <>
              <AppSidebar>
                <AppSidebarHeader>
                  <AppSidebarDefaultHeader />
                </AppSidebarHeader>

                <AppSidebarContent>
                  <AppSidebarWorkspacesContent />
                </AppSidebarContent>

                <AppSidebarFooter>
                  <AppSidebarWorkspacesFooter />
                </AppSidebarFooter>
              </AppSidebar>

              <main className="flex h-full flex-1 flex-col overflow-hidden">
                {/* Barra Superior Twenty Colada ao Topo (Acima de Toda a Divisão da Timerbar) */}
                <div className="border-border/60 bg-background/95 z-20 flex h-10 shrink-0 items-center justify-between border-b px-4 backdrop-blur-sm select-none">
                  <div className="flex items-center gap-2">
                    <PageIcon className="text-muted-foreground size-3.5" />
                    <span className="text-foreground text-xs font-semibold tracking-tight">
                      {pageInfo.title}
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

                  {/* CENTRO */}
                  <div className="bg-muted/10 min-w-0 flex-1">
                    <ScrollArea className="h-full">
                      <section className="px-4 py-4">
                        <Outlet />
                      </section>
                      <Footer />
                    </ScrollArea>
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
              </main>

              <AddonsManagerModal
                open={isAddonsModalOpen}
                onOpenChange={(open) => {
                  if (!open) closeModal()
                }}
              />
            </>
          </TimeEntryProvider>
        </SyncProvider>
      </DataSourceConnectionsProvider>
    </WorkspaceProvider>
  )
}

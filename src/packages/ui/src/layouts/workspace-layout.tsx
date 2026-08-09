import { Outlet, useParams } from 'react-router'

import {
  AppSidebar,
  AppSidebarContent,
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarWorkspacesContent,
  AppSidebarWorkspacesFooter,
  Header,
} from '@/components'
import { AppSidebarDefaultHeader } from '@/components/app-sidebar/app-sidebar-default-header'
import { Footer } from '@/components/footer'
import { UltimateTimeTracker } from '@/components/time-bar/ultimate-entry-bar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataSourceConnectionsProvider } from '@/contexts/DataSourceConnectionsContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useTimerSettings } from '@/hooks/use-timer-settings'
import { SyncProvider } from '@/stores/syncStore'
import { TimeEntryProvider } from '@/stores/timeEntryStore'

export function WorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { widgetPosition } = useTimerSettings()

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

              <Header />

              <main className="flex h-full flex-1 flex-col overflow-hidden">
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
                      <section className="px-4 pt-12">
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
            </>
          </TimeEntryProvider>
        </SyncProvider>
      </DataSourceConnectionsProvider>
    </WorkspaceProvider>
  )
}

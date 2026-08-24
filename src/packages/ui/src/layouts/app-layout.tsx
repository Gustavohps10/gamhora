'use client'

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { AppRail } from '@/components/app-rail'
import { DraftWorkspacesPanel } from '@/components/draft-workspace-panel'
import { NewWorkspaceDialog } from '@/components/new-workspace-dialog'
import { Toaster } from '@/components/ui/sonner'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { useOpenAPI } from '@/hooks'
import { DataSourceConnectionsProvider } from '@/providers'
import { SyncProvider } from '@/stores/syncStore'

export function AppLayout() {
  const [workspaceDialogIsOpen, setWorkspaceDialogIsOpen] = useState(false)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<
    string | undefined
  >()
  const navigate = useNavigate()
  const location = useLocation()
  const openAPI = useOpenAPI()

  useEffect(() => {
    if (!openAPI?.events?.on) return

    const unsub = openAPI.events.on<{ workspaceId: string }>(
      'workspace:switched',
      ({ workspaceId }) => {
        if (!workspaceId) return

        const currentPath = location.pathname
        if (currentPath.includes(`/workspaces/${workspaceId}`)) return

        if (currentPath.startsWith('/workspaces/')) {
          const parts = currentPath.split('/')
          // ['', 'workspaces', ':workspaceId', ...subpath]
          parts[2] = workspaceId
          navigate(parts.join('/'))
        } else {
          navigate(`/workspaces/${workspaceId}/time-entries`)
        }
      },
    )

    return () => unsub?.()
  }, [openAPI, navigate, location.pathname])

  return (
    <>
      <main className="flex h-screen w-screen overflow-hidden pt-12">
        <WorkspaceProvider workspaceId={activeWorkspaceId}>
          <DataSourceConnectionsProvider>
            <SyncProvider>
              <NewWorkspaceDialog
                isOpen={workspaceDialogIsOpen}
                setIsOpen={setWorkspaceDialogIsOpen}
                setWorkspaceId={setActiveWorkspaceId}
              />
              {/* Sidebar */}
              <AppRail
                onNewWorkspaceClick={() => {
                  setActiveWorkspaceId(undefined)
                  setWorkspaceDialogIsOpen(true)
                }}
              />

              {/* Painel de drafts */}
              <DraftWorkspacesPanel
                onOpenWorkspace={(id) => {
                  console.log(id)
                  setActiveWorkspaceId(id)
                  setWorkspaceDialogIsOpen(true)
                }}
              />
            </SyncProvider>
          </DataSourceConnectionsProvider>
        </WorkspaceProvider>

        <section className="flex flex-1 overflow-hidden rounded-tl-md border-t border-l">
          <Outlet />
        </section>
      </main>
      <Toaster />
    </>
  )
}

import {
  ActivitiesLayout,
  AddonsLayout,
  AppLayout,
  HomeLayout,
  WidgetLayout,
  WorkspaceLayout,
} from '@gamhora/ui/layouts'
import {
  Activities,
  AddonsPage,
  AddonsSettingsPage,
  AddonsStorePage,
  Backlog,
  Error,
  Metrics,
  Notes,
  NotFound,
  TimeEntries,
  TimerWidget,
  WorkspaceSettings,
} from '@gamhora/ui/pages'
import { createHashRouter, Navigate } from 'react-router-dom'

export const router = createHashRouter([
  // 1. ROTAS ISOLADAS DE WIDGETS (Fora do AppLayout)
  {
    path: 'workspaces/:workspaceId/widgets',
    element: <WidgetLayout />,
    errorElement: <Error />,
    children: [
      {
        errorElement: <Error />,
        children: [
          { path: 'timer', element: <TimerWidget /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },

  // 2. APLICAÇÃO PRINCIPAL (Com AppRail, Sidebars e Layout Padrão)
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        errorElement: <Error />,
        children: [
          {
            path: '/',
            element: <HomeLayout />,
            children: [
              {
                errorElement: <Error />,
                children: [
                  { index: true, element: <div>Home</div> },
                  { path: 'about', element: <div>About</div> },
                  { path: 'contact', element: <div>Contact</div> },
                  { path: '*', element: <NotFound /> },
                ],
              },
            ],
          },
          {
            path: 'workspaces/:workspaceId',
            element: <WorkspaceLayout />,
            children: [
              {
                errorElement: <Error />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="time-entries" replace />,
                  },
                  { path: 'notes', element: <Notes /> },
                  { path: 'time-entries', element: <TimeEntries /> },
                  { path: 'my-metric', element: <Metrics /> },
                  {
                    path: 'activities',
                    element: <ActivitiesLayout />,
                    children: [
                      {
                        errorElement: <Error />,
                        children: [
                          { index: true, element: <Activities /> },
                          { path: 'backlog', element: <Backlog /> },
                          { path: '*', element: <NotFound /> },
                        ],
                      },
                    ],
                  },
                  { path: 'settings', element: <WorkspaceSettings /> },
                  {
                    path: 'addons',
                    element: <AddonsLayout />,
                    children: [
                      {
                        errorElement: <Error />,
                        children: [
                          {
                            index: true,
                            element: <Navigate to="store" replace />,
                          },
                          { path: 'store', element: <AddonsStorePage /> },
                          {
                            path: 'store/available',
                            element: <AddonsStorePage />,
                          },
                          {
                            path: 'settings/:capability',
                            element: <AddonsSettingsPage />,
                          },
                          {
                            path: 'settings',
                            element: (
                              <Navigate to="settings/data-sources" replace />
                            ),
                          },
                          { path: ':category', element: <AddonsPage /> },
                          {
                            path: ':category/available',
                            element: <AddonsPage />,
                          },
                        ],
                      },
                    ],
                  },
                  { path: '*', element: <NotFound /> },
                ],
              },
            ],
          },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

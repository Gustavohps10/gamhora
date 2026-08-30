import type { SidebarMenuItem as AddonSidebarMenuItem } from '@pandhora/sdk'
import {
  Brain,
  CalendarDays,
  ChartColumnBig,
  ChevronRight,
  FolderGit2,
  Layers,
  LayoutDashboard,
  ListTodo,
  ListTodoIcon,
  Lock,
  LucideIcon,
  PuzzleIcon,
  Scale,
  SettingsIcon,
  Terminal,
  Timer,
  User,
  WaypointsIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AiOutlineCloudSync } from 'react-icons/ai'
import { NavLink, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAddonsModalStore } from '@/stores/addonsModalStore'

interface NavItem {
  title: string
  path: string
  icon: React.ElementType
  isPro?: boolean
  isBlocked?: boolean
  blockedReason?: string
  onClick?: () => void
}

const personalItems: NavItem[] = [
  {
    title: 'Minhas Tarefas',
    path: 'activities',
    icon: ListTodoIcon,
    isBlocked: true,
    blockedReason: 'Em breve',
  },
  {
    title: 'Meus Apontamentos',
    path: 'time-entries',
    icon: Timer,
  },
  {
    title: 'Métricas',
    path: 'my-metric',
    icon: ChartColumnBig,
  },
  {
    title: 'Calendário',
    path: 'calendar',
    icon: CalendarDays,
    isBlocked: true,
    blockedReason: 'Em breve',
  },
]

const teamItems: NavItem[] = [
  {
    title: 'Visão Geral',
    path: 'team',
    icon: LayoutDashboard,
    isPro: true,
  },
  {
    title: 'Membros',
    path: 'members',
    icon: User,
    isPro: true,
  },
  {
    title: 'Carga de Trabalho',
    path: 'workload',
    icon: Scale,
    isPro: true,
  },
  {
    title: 'Insights IA',
    path: 'insights',
    icon: Brain,
    isPro: true,
  },
]

const integrationItems: NavItem[] = [
  {
    title: 'Addons',
    path: '',
    icon: PuzzleIcon,
    onClick: () => useAddonsModalStore.getState().openModal(),
  },
]

const workspaceItems: NavItem[] = [
  {
    title: 'Configurações',
    path: 'settings',
    icon: SettingsIcon,
  },
]

const synchronizationItems: NavItem[] = [
  {
    title: 'Conexões',
    path: 'sync/connections',
    icon: WaypointsIcon,
  },
  {
    title: 'Logs',
    path: 'sync/logs',
    icon: Terminal,
  },
]

interface SidebarNavItemProps {
  item: NavItem
  workspaceId: string | undefined
  end?: boolean
  nested?: boolean
}

function SidebarNavItem({
  item,
  workspaceId,
  end = false,
  nested = false,
}: SidebarNavItemProps) {
  if (item.isBlocked) {
    return <SidebarBlockedNavItem item={item} />
  }

  if (item.onClick) {
    return (
      <SidebarMenuItem className={nested ? 'ml-2' : undefined}>
        <SidebarMenuButton
          size={nested ? 'sm' : 'default'}
          onClick={item.onClick}
          className="flex w-full cursor-pointer items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <item.icon
              size={nested ? 16 : 18}
              className={nested ? 'text-foreground/60' : 'text-foreground/70'}
            />
            <span>{item.title}</span>
          </div>
          {item.isPro && <ProBadge />}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem className={nested ? 'ml-2' : undefined}>
      <SidebarMenuButton asChild size={nested ? 'sm' : 'default'}>
        <NavLink
          to={`/workspaces/${workspaceId}/${item.path}`}
          end={end}
          className={[
            'z-40 flex items-center justify-between rounded-md transition-colors',
            '[&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-2">
                <item.icon
                  size={nested ? 16 : 18}
                  className={
                    isActive
                      ? 'text-primary'
                      : nested
                        ? 'text-foreground/60'
                        : 'text-foreground/70'
                  }
                />

                <span>{item.title}</span>
              </div>

              {item.isPro && <ProBadge />}
            </>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface SidebarBlockedNavItemProps {
  item: NavItem
}

function SidebarBlockedNavItem({ item }: SidebarBlockedNavItemProps) {
  return (
    <SidebarMenuItem>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              disabled
              className="cursor-not-allowed opacity-50 select-none hover:bg-transparent"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon size={18} className="text-foreground/50" />

                  <span className="text-foreground/60">{item.title}</span>
                </div>

                <Lock size={14} className="text-muted-foreground" />
              </div>
            </SidebarMenuButton>
          </TooltipTrigger>

          <TooltipContent side="right">
            <p>{item.blockedReason ?? 'Bloqueado temporariamente'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  )
}

function ProBadge() {
  return (
    <Badge
      variant="secondary"
      className="h-4 border-amber-500/20 bg-amber-500/10 px-1 text-[9px] font-bold tracking-widest text-amber-600 uppercase"
    >
      Pro
    </Badge>
  )
}

interface SidebarNavItemsProps {
  items: NavItem[]
  workspaceId: string | undefined
  end?: boolean
  nested?: boolean
}

function SidebarNavItems({
  items,
  workspaceId,
  end = false,
  nested = false,
}: SidebarNavItemsProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarNavItem
          key={item.path}
          item={item}
          workspaceId={workspaceId}
          end={end}
          nested={nested}
        />
      ))}
    </SidebarMenu>
  )
}

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>

      <SidebarGroupContent>{children}</SidebarGroupContent>
    </SidebarGroup>
  )
}

interface SidebarSyncMenuProps {
  workspaceId: string | undefined
}

function SidebarSyncMenu({ workspaceId }: SidebarSyncMenuProps) {
  return (
    <SidebarMenu>
      <Collapsible defaultOpen className="group/synchronization">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <AiOutlineCloudSync
                style={{ width: 18, height: 18 }}
                className="text-foreground/70"
              />

              <span>Sincronização</span>

              <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/synchronization:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-1">
              <SidebarNavItems
                items={synchronizationItems}
                workspaceId={workspaceId}
                nested
              />
            </div>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  )
}

import { useOpenAPI } from '@/hooks'

const iconMap: Record<string, LucideIcon> = {
  Layers,
  ListTodo,
  FolderGit2,
  Puzzle: PuzzleIcon,
}

function resolveIcon(name?: string): LucideIcon {
  if (name && iconMap[name]) {
    return iconMap[name]
  }
  return PuzzleIcon
}

function SidebarAddonSection({
  workspaceId,
}: {
  workspaceId: string | undefined
}) {
  const api = useOpenAPI()
  const [addonMenus, setAddonMenus] = useState<AddonSidebarMenuItem[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadAddonMenus() {
      try {
        const response = await api.integrations.addons.getSidebarMenus()
        if (!isMounted) return
        if (!response?.isSuccess || !Array.isArray(response.data)) return
        setAddonMenus(response.data)
      } catch (err) {
        console.error('Erro ao carregar menus dos addons:', err)
      }
    }

    loadAddonMenus()
    return () => {
      isMounted = false
    }
  }, [api])

  if (addonMenus.length === 0) return null

  return (
    <SidebarSection title="Addons Registrados">
      <SidebarMenu>
        {addonMenus.map((menu) => {
          const Icon = resolveIcon(menu.icon)

          if (menu.children && menu.children.length > 0) {
            return (
              <Collapsible
                key={menu.id}
                defaultOpen
                className="group/addon-menu"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Icon size={18} className="text-foreground/70" />
                      <span>{menu.label}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/addon-menu:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 flex flex-col space-y-1">
                      {menu.children.map((sub) => {
                        const SubIcon = resolveIcon(sub.icon)
                        return (
                          <SidebarMenuItem key={sub.id} className="ml-2">
                            <SidebarMenuButton asChild size="sm">
                              <NavLink
                                to={`/workspaces/${workspaceId}${sub.href}`}
                                className="flex items-center gap-2 rounded-md transition-colors [&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800"
                              >
                                <SubIcon
                                  size={16}
                                  className="text-foreground/60"
                                />
                                <span>{sub.label}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={menu.id}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={`/workspaces/${workspaceId}${menu.href ?? ''}`}
                  className="flex items-center gap-2 rounded-md transition-colors [&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800"
                >
                  <Icon size={18} className="text-foreground/70" />
                  <span>{menu.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarSection>
  )
}

export function AppSidebarWorkspacesContent() {
  const { workspaceId } = useParams<{
    workspaceId: string
  }>()

  return (
    <>
      <SidebarSection title="Controle Pessoal">
        <SidebarNavItems items={personalItems} workspaceId={workspaceId} />
      </SidebarSection>

      <SidebarSection title="Gestão de Time">
        <SidebarNavItems items={teamItems} workspaceId={workspaceId} />
      </SidebarSection>

      <SidebarSection title="Integrações">
        <SidebarNavItems items={integrationItems} workspaceId={workspaceId} />
      </SidebarSection>

      <SidebarAddonSection workspaceId={workspaceId} />

      <SidebarSection title="Workspace">
        <SidebarNavItems items={workspaceItems} workspaceId={workspaceId} />

        <div className="mt-2">
          <SidebarSyncMenu workspaceId={workspaceId} />
        </div>
      </SidebarSection>
    </>
  )
}

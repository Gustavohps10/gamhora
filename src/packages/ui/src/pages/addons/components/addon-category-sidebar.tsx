'use client'

import { Database, GlobeIcon, Palette, ShoppingBag, Wrench } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

export type AddonCapabilityType =
  'data-sources' | 'watchers' | 'themes' | 'utilities'

export type AddonCategory = 'integrations' | 'watchers' | 'themes' | 'utilities'

export const CAPABILITY_SECTIONS: Array<{
  id: AddonCapabilityType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { id: 'data-sources', label: 'Fontes de Dados', icon: Database },
  { id: 'watchers', label: 'Watchers & Captura', icon: GlobeIcon },
  { id: 'utilities', label: 'Utilitários & IA', icon: Wrench },
  { id: 'themes', label: 'Temas & Interface', icon: Palette },
]

export function AddonCategorySidebar() {
  const { workspaceId, capability = 'data-sources' } = useParams<{
    workspaceId?: string
    capability?: string
  }>()

  return (
    <nav className="w-full shrink-0 space-y-6">
      <div className="space-y-1">
        <p className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
          Marketplace
        </p>
        <NavLink
          to={`/workspaces/${workspaceId}/addons/store`}
          className={({ isActive }) =>
            cn(
              'hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground',
            )
          }
        >
          <ShoppingBag className="h-4 w-4" />
          Loja de Addons
        </NavLink>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
          Configurações
        </p>
        <ul className="space-y-1">
          {CAPABILITY_SECTIONS.map((section) => {
            const Icon = section.icon
            const isSelected = capability === section.id

            return (
              <li key={section.id}>
                <NavLink
                  to={`/workspaces/${workspaceId}/addons/settings/${section.id}`}
                  className={cn(
                    'hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-secondary text-secondary-foreground font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

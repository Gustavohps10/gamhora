import { AddonManifestViewModel } from '@metric-org/sdk'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  GlobeIcon,
  Palette,
  PuzzleIcon,
  Search,
  Settings2,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useOpenAPI } from '@/hooks/use-open-api'

import { AddonSettingsRenderer } from './addon-settings-renderer'

interface AddonsManagerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SidebarSection = 'updates' | 'installed' | 'browse' | 'settings'

function getCategoryIcon(cat: string) {
  const c = cat.toLowerCase()
  if (c.includes('datasource')) return Database
  if (c.includes('watcher')) return GlobeIcon
  if (c.includes('theme')) return Palette
  if (c.includes('punch')) return Wrench
  return Settings2
}

const OFFICIAL_CATEGORIES = [
  { id: 'DataSources', label: 'Fontes De Dados', icon: Database },
  { id: 'Watchers', label: 'Observadores', icon: GlobeIcon },
  { id: 'Calendars', label: 'Calendários', icon: Calendar },
  { id: 'Punch', label: 'Ponto Eletrônico', icon: Clock },
  { id: 'Themes', label: 'Temas', icon: Palette },
]

function getAddonCategory(addon: AddonManifestViewModel): string {
  if (addon.category) return addon.category.toLowerCase()
  const tags = addon.tags || []
  if (
    tags.some(
      (t: string) =>
        t.toLowerCase().includes('datasource') ||
        t.toLowerCase().includes('redmine') ||
        t.toLowerCase().includes('mock') ||
        t.toLowerCase().includes('fonte'),
    )
  ) {
    return 'datasources'
  }
  if (
    tags.some(
      (t: string) =>
        t.toLowerCase().includes('watcher') ||
        t.toLowerCase().includes('observador') ||
        t.toLowerCase().includes('discord') ||
        t.toLowerCase().includes('ai') ||
        t.toLowerCase().includes('ocr'),
    )
  ) {
    return 'watchers'
  }
  if (
    tags.some(
      (t: string) =>
        t.toLowerCase().includes('calendar') ||
        t.toLowerCase().includes('agenda') ||
        t.toLowerCase().includes('calendario'),
    )
  ) {
    return 'calendars'
  }
  if (
    tags.some(
      (t: string) =>
        t.toLowerCase().includes('punch') || t.toLowerCase().includes('ponto'),
    )
  ) {
    return 'punch'
  }
  if (
    tags.some(
      (t: string) =>
        t.toLowerCase().includes('theme') || t.toLowerCase().includes('tema'),
    )
  ) {
    return 'themes'
  }
  return 'datasources'
}

function SafeAddonLogo({
  src,
  alt = '',
  className = 'h-full w-full object-cover',
  fallbackIconClassName = 'h-4 w-4 text-muted-foreground',
}: {
  src?: string
  alt?: string
  className?: string
  fallbackIconClassName?: string
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <PuzzleIcon className={fallbackIconClassName} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}

export function AddonsManagerModal({
  open,
  onOpenChange,
}: AddonsManagerModalProps) {
  const openAPI = useOpenAPI()
  const [activeSection, setActiveSection] =
    useState<SidebarSection>('installed')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null)

  const { data: installedList = [] } = useQuery<AddonManifestViewModel[]>({
    queryKey: ['plugins', 'installed'],
    queryFn: async () => {
      const res = await openAPI.integrations.addons.listInstalled()
      if (!res.isSuccess) throw new Error(res.error)
      return res.data ?? []
    },
  })

  const { data: availableList = [] } = useQuery<AddonManifestViewModel[]>({
    queryKey: ['plugins', 'available'],
    queryFn: async () => {
      const res = await openAPI.integrations.addons.listAvailable()
      if (!res.isSuccess) throw new Error(res.error)
      return res.data ?? []
    },
    enabled: activeSection === 'browse',
  })

  const handleSelectSection = (
    section: SidebarSection,
    cat: string | null = null,
  ) => {
    setActiveSection(section)
    setActiveCategory(cat)
    setSelectedAddonId(null)
  }

  const renderManagerSidebarItem = (
    id: SidebarSection,
    label: string,
    Icon: any,
  ) => (
    <button
      onClick={() => handleSelectSection(id)}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
        activeSection === id && !activeCategory
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-muted'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )

  const renderCategoryItem = (cat: {
    id: string
    label: string
    icon: any
  }) => {
    const Icon = cat.icon
    return (
      <button
        key={cat.id}
        onClick={() => handleSelectSection('settings', cat.id)}
        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
          activeSection === 'settings' && activeCategory === cat.id
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted'
        }`}
      >
        <Icon className="h-4 w-4" /> {cat.label}
      </button>
    )
  }

  const renderInstalledView = () => {
    return (
      <div className="p-6">
        <h2 className="mb-6 text-2xl font-bold">Addons Instalados</h2>
        <div className="space-y-8">
          {OFFICIAL_CATEGORIES.map((cat) => {
            const addonsInCat = installedList.filter(
              (a) => getAddonCategory(a) === cat.id.toLowerCase(),
            )
            if (addonsInCat.length === 0) return null
            return (
              <div key={cat.id}>
                <h3 className="mb-3 border-b pb-2 text-lg font-semibold">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {addonsInCat.map((addon) => (
                    <div
                      key={addon.id}
                      className="bg-card flex gap-4 rounded-lg border p-4"
                    >
                      <div className="bg-muted/50 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border p-1.5 shadow-2xs">
                        <SafeAddonLogo
                          src={addon.logo}
                          alt={addon.name}
                          className="h-full w-full object-contain"
                          fallbackIconClassName="h-6 w-6 text-muted-foreground/60"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold">
                          {addon.name}
                        </h4>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderBrowseView = () => {
    const selectedAddon = availableList.find((a) => a.id === selectedAddonId)
    return (
      <div className="flex h-full">
        {/* Left List */}
        <div className="bg-muted/5 flex w-[300px] flex-col border-r">
          <div className="border-b p-3">
            <Input placeholder="Buscar Addons..." className="h-8" />
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {availableList.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => setSelectedAddonId(addon.id)}
                  className={`flex w-full cursor-pointer gap-3 rounded-md p-3 text-left transition-colors ${
                    selectedAddonId === addon.id
                      ? 'bg-primary/10 text-primary border-primary/20 border font-medium'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="bg-background flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border p-1 shadow-2xs">
                    <SafeAddonLogo
                      src={addon.logo}
                      alt={addon.name}
                      className="h-full w-full object-contain"
                      fallbackIconClassName="h-5 w-5 text-muted-foreground/60"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="truncate text-sm font-medium">
                      {addon.name}
                    </span>
                    <span className="truncate text-xs opacity-70">
                      {addon.creator}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* Right Details */}
        <div className="bg-background flex flex-1 flex-col overflow-auto p-8">
          {selectedAddon ? (
            <div className="max-w-2xl">
              <div className="mb-8 flex items-start gap-6">
                <div className="bg-muted/50 flex h-24 w-24 items-center justify-center rounded-lg border p-2.5 shadow-sm">
                  <SafeAddonLogo
                    src={selectedAddon.logo}
                    alt={selectedAddon.name}
                    className="h-full w-full object-contain"
                    fallbackIconClassName="h-10 w-10 text-muted-foreground/60"
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-3xl font-bold">{selectedAddon.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    por {selectedAddon.creator} • Versão {selectedAddon.version}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button className="cursor-pointer">Instalar</Button>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Descrição</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {selectedAddon.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              Selecione um Addon para ver detalhes
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSettingsView = () => {
    const activeCategoryObj = OFFICIAL_CATEGORIES.find(
      (c) => c.id.toLowerCase() === activeCategory?.toLowerCase(),
    )
    const categoryLabel = activeCategoryObj?.label || activeCategory
    const addonsInCat = installedList.filter(
      (a) => getAddonCategory(a) === activeCategory?.toLowerCase(),
    )
    return (
      <div className="flex h-full">
        <div className="bg-muted/5 flex w-[260px] flex-col border-r">
          <div className="flex items-center gap-2 border-b p-4">
            <span className="text-sm font-semibold">{categoryLabel}</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {addonsInCat.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => setSelectedAddonId(addon.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedAddonId === addon.id
                      ? 'bg-primary/10 text-primary border-primary/20 border font-medium shadow-2xs'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="bg-background flex h-7 w-7 shrink-0 items-center justify-center rounded-md border p-1 shadow-2xs">
                    <SafeAddonLogo
                      src={addon.logo}
                      alt={addon.name}
                      className="h-full w-full object-contain"
                      fallbackIconClassName="h-4 w-4 text-muted-foreground/60"
                    />
                  </div>
                  <span className="truncate">{addon.name}</span>
                </button>
              ))}
              {addonsInCat.length === 0 && (
                <div className="text-muted-foreground p-4 text-center text-xs">
                  Nenhum plugin instalado nesta categoria.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="bg-background flex flex-1 flex-col">
          {selectedAddonId ? (
            <AddonSettingsRenderer addonId={selectedAddonId} />
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              Selecione um Addon para configurar
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] w-[90vw] flex-row gap-0 overflow-hidden p-0 sm:max-w-[1200px]">
        {/* Left Navigation Tree */}
        <div className="bg-muted/30 flex h-full w-[240px] flex-shrink-0 flex-col border-r">
          <div className="border-b p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <PuzzleIcon className="text-primary h-5 w-5" />
              Addons
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-3">
              <div className="space-y-1">
                <h3 className="text-muted-foreground/70 mb-2 px-2 text-xs font-bold tracking-wider">
                  Gerenciador
                </h3>
                {renderManagerSidebarItem('updates', 'Atualizações', Download)}
                {renderManagerSidebarItem(
                  'installed',
                  'Instalados',
                  CheckCircle,
                )}
                {renderManagerSidebarItem('browse', 'Explorar', Search)}
              </div>

              <div className="space-y-1">
                <h3 className="text-muted-foreground/70 mb-2 px-2 text-xs font-bold tracking-wider">
                  Configurações De Extensões
                </h3>
                {OFFICIAL_CATEGORIES.map((cat) => renderCategoryItem(cat))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Dynamic Right Area */}
        <div className="bg-background flex h-full flex-1 flex-col overflow-hidden">
          {activeSection === 'installed' && renderInstalledView()}
          {activeSection === 'browse' && renderBrowseView()}
          {activeSection === 'settings' && renderSettingsView()}
          {activeSection === 'updates' && (
            <div className="p-6">
              <h2 className="mb-6 text-2xl font-bold">Atualizações</h2>
              <p className="text-muted-foreground">
                Nenhuma atualização disponível no momento.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

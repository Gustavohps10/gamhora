import type { AddonSettingsField } from '@metric-org/application'
import { CheckCircle2, User, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useOpenAPI } from '../hooks/use-open-api'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface AddonSettingsPanelProps {
  addonId: string
}

interface ConnectedUserInfo {
  id?: string
  username?: string
  global_name?: string
  avatarUrl?: string
}

export function AddonSettingsPanel({ addonId }: AddonSettingsPanelProps) {
  const { workspaceId = 'default' } = useParams<{ workspaceId?: string }>()
  const storageKey = `addon_user_${workspaceId}_${addonId}`

  const [schema, setSchema] = useState<AddonSettingsField[]>([])
  const [loading, setLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [connectedUser, setConnectedUser] = useState<ConnectedUserInfo | null>(
    () => {
      try {
        const stored = localStorage.getItem(storageKey)
        if (!stored) return null
        return JSON.parse(stored) as ConnectedUserInfo
      } catch {
        return null
      }
    },
  )

  const api = useOpenAPI()

  useEffect(() => {
    if (workspaceId) {
      api.integrations.addons.setActiveWorkspace({ body: { workspaceId } })
    }
    async function loadSchema() {
      setLoading(true)
      try {
        const res = await api.integrations.addons.getSchema({
          body: { addonId },
        })
        if (res.isSuccess && res.data) {
          setSchema(res.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSchema()
  }, [addonId, workspaceId, api])

  const handleAction = async (actionId: string) => {
    setIsExecuting(true)
    try {
      const res = await api.integrations.addons.executeAction({
        body: { addonId, actionId, payload: { workspaceId } },
      })

      if (!res.isSuccess) {
        toast.error(res.error ?? 'Falha ao executar ação do plugin')
        return
      }

      const rawData = res.data as unknown
      const actionData =
        (rawData as { isSuccess?: boolean; data?: ConnectedUserInfo })?.data ??
        (rawData as ConnectedUserInfo)

      if (
        actionData?.avatarUrl ||
        actionData?.username ||
        actionData?.global_name
      ) {
        setConnectedUser(actionData)
        localStorage.setItem(storageKey, JSON.stringify(actionData))
        toast.success(
          `Autenticado com sucesso como ${actionData.global_name ?? actionData.username}!`,
        )
        return
      }

      toast.success('Ação executada com sucesso!')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await api.integrations.addons.executeAction({
        body: { addonId, actionId: 'disconnect', payload: { workspaceId } },
      })
    } catch (err) {
      console.error(err)
    }
    setConnectedUser(null)
    localStorage.removeItem(storageKey)
    toast.info('Sessão encerrada para este workspace.')
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-4 text-xs">
        Carregando opções...
      </div>
    )
  }

  // Filter fields: when connected, hide the 'login' button
  const visibleFields = schema.filter((field) => {
    if (connectedUser && field.id === 'login') return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      {/* User Connection Status Badge */}
      {connectedUser && (
        <div className="bg-secondary/30 border-border/80 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-sm">
              {connectedUser.avatarUrl ? (
                <img
                  src={connectedUser.avatarUrl}
                  alt={
                    connectedUser.global_name ??
                    connectedUser.username ??
                    'Avatar'
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="text-muted-foreground h-5 w-5" />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {connectedUser.global_name ??
                    connectedUser.username ??
                    'Usuário Autenticado'}
                </span>
                <Badge
                  variant="outline"
                  className="gap-1 rounded-md border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Conectado
                </Badge>
              </div>
              {connectedUser.username && (
                <span className="text-muted-foreground text-xs">
                  @{connectedUser.username}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="text-muted-foreground hover:text-destructive h-8 gap-1.5 rounded-lg text-xs"
          >
            <WifiOff className="h-3.5 w-3.5" />
            Desconectar
          </Button>
        </div>
      )}

      {/* Dynamic Actions & Fields */}
      <div className="space-y-3">
        {visibleFields.map((field) => {
          if (field.type === 'button') {
            return (
              <Button
                key={field.id}
                onClick={() => handleAction(field.id)}
                disabled={isExecuting}
                variant={field.variant ?? 'default'}
                className="w-full rounded-lg text-xs font-medium"
              >
                {isExecuting ? 'Executando...' : field.label}
              </Button>
            )
          }
          return (
            <div key={field.id} className="text-muted-foreground text-xs">
              Tipo de campo não suportado: {field.type}
            </div>
          )
        })}
      </div>
    </div>
  )
}

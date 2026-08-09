import { LayoutGridIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  UltimateTimeTracker,
  useTrackerContext,
} from '@/components/time-bar/ultimate-entry-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'

// 1. Criamos o nosso Bloco Customizado que consome o Contexto da Barra
function WorkspaceSelectorBlock() {
  const { workspaces } = useWorkspace()
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  // Pegamos a orientação da barra de forma reativa do contexto
  const { isVertical, widgetPosition } = useTrackerContext()

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="hover:bg-muted/50 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          title="Trocar Workspace"
        >
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarImage src={currentWorkspace?.avatarUrl} />
            <AvatarFallback className="bg-primary/20 text-primary rounded-md">
              <LayoutGridIcon className="size-3" />
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent
        // Abre para o lado oposto da borda onde o widget está fixado
        side={
          isVertical
            ? widgetPosition === 'left'
              ? 'right'
              : 'left'
            : widgetPosition === 'top'
              ? 'bottom'
              : 'top'
        }
        sideOffset={12}
        className={cn(
          'bg-card/90 border-border/50 flex w-fit gap-2 rounded-xl p-2 shadow-xl backdrop-blur-sm',
          // Se a barra for vertical, a lista expande na horizontal. Se a barra for horizontal, expande na vertical.
          isVertical ? 'flex-row' : 'flex-col',
        )}
      >
        {workspaces
          ?.filter((w) => w.status === 'configured')
          .map((ws) => (
            <button
              key={ws.id}
              onClick={() => {
                // Navega para a mesma rota de widget, mas com o novo Workspace ID
                navigate(`/workspaces/${ws.id}/widgets/timer`)
                setIsOpen(false)
              }}
              className={cn(
                'group hover:bg-primary/20 relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                ws.id === workspaceId && 'ring-primary ring-2',
              )}
              title={ws.name}
            >
              <Avatar className="h-full w-full rounded-md">
                <AvatarImage src={ws.avatarUrl} className="object-cover" />
                <AvatarFallback className="rounded-md bg-transparent">
                  <LayoutGridIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
      </PopoverContent>
    </Popover>
  )
}

// 2. Montamos a composição do Widget final
export function TimerWidget() {
  useEffect(() => {
    document.body.style.background = 'transparent'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <UltimateTimeTracker>
      <UltimateTimeTracker.Handle />

      <UltimateTimeTracker.Blocks>
        {/* INJETAMOS O NOSSO BLOCO NOVO AQUI! O ID 'workspace' será salvo no cache de ordem */}
        <UltimateTimeTracker.Block id="workspace">
          <WorkspaceSelectorBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="task">
          {/* Escondemos a task na vertical (pois usamos o botão 'details') mantendo a regra padrão */}
          <div className="hidden md:flex">
            <UltimateTimeTracker.TaskBlock />
          </div>
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="timer">
          <UltimateTimeTracker.TimerBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="today">
          <UltimateTimeTracker.TodayBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="actions">
          <UltimateTimeTracker.ActionsBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="tools">
          <UltimateTimeTracker.ToolsBlock />
        </UltimateTimeTracker.Block>

        <UltimateTimeTracker.Block id="details">
          <UltimateTimeTracker.DetailsBlock />
        </UltimateTimeTracker.Block>
      </UltimateTimeTracker.Blocks>

      <UltimateTimeTracker.InlineInput />
    </UltimateTimeTracker>
  )
}

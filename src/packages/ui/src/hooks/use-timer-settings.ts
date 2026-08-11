import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WidgetPosition = 'top' | 'bottom' | 'left' | 'right'

interface TimerSettingsState {
  timerDirection: 'up' | 'down'
  widgetPosition: WidgetPosition
  selectedDisplayId: number | null
  selectedWorkspaceId: string | null // <-- NOVO: Guarda o último workspace utilizado
  discordRpc: boolean
  antiBurnout: boolean
  activeWindowTracking: boolean
  hiddenBlocks: string[]

  setTimerDirection: (val: 'up' | 'down') => void
  setWidgetPosition: (val: WidgetPosition) => void
  setSelectedDisplayId: (val: number | null) => void
  setSelectedWorkspaceId: (val: string | null) => void // <-- NOVO
  setDiscordRpc: (val: boolean) => void
  setAntiBurnout: (val: boolean) => void
  setActiveWindowTracking: (val: boolean) => void
  toggleHiddenBlock: (id: string) => void
}

export const useTimerSettings = create<TimerSettingsState>()(
  persist(
    (set) => ({
      timerDirection: 'up',
      widgetPosition: 'bottom',
      selectedDisplayId: null,
      selectedWorkspaceId: null,
      discordRpc: false,
      antiBurnout: true,
      activeWindowTracking: false,
      hiddenBlocks: [],

      setTimerDirection: (val) => set({ timerDirection: val }),
      setWidgetPosition: (val) => set({ widgetPosition: val }),
      setSelectedDisplayId: (val) => set({ selectedDisplayId: val }),
      setSelectedWorkspaceId: (val) => set({ selectedWorkspaceId: val }),
      setDiscordRpc: (val) => set({ discordRpc: val }),
      setAntiBurnout: (val) => set({ antiBurnout: val }),
      setActiveWindowTracking: (val) => set({ activeWindowTracking: val }),

      toggleHiddenBlock: (id) =>
        set((state) => ({
          hiddenBlocks: state.hiddenBlocks.includes(id)
            ? state.hiddenBlocks.filter((b) => b !== id)
            : [...state.hiddenBlocks, id],
        })),
    }),
    {
      name: 'metric-timer-preferences',
    },
  ),
)

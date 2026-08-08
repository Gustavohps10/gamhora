import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WidgetPosition = 'top' | 'bottom' | 'left' | 'right'

interface TimerSettingsState {
  timerDirection: 'up' | 'down'
  widgetPosition: WidgetPosition
  discordRpc: boolean
  antiBurnout: boolean
  activeWindowTracking: boolean

  setTimerDirection: (val: 'up' | 'down') => void
  setWidgetPosition: (val: WidgetPosition) => void
  setDiscordRpc: (val: boolean) => void
  setAntiBurnout: (val: boolean) => void
  setActiveWindowTracking: (val: boolean) => void
}

export const useTimerSettings = create<TimerSettingsState>()(
  persist(
    (set) => ({
      timerDirection: 'up',
      widgetPosition: 'bottom',
      discordRpc: false,
      antiBurnout: true,
      activeWindowTracking: false,

      setTimerDirection: (val) => set({ timerDirection: val }),
      setWidgetPosition: (val) => set({ widgetPosition: val }),
      setDiscordRpc: (val) => set({ discordRpc: val }),
      setAntiBurnout: (val) => set({ antiBurnout: val }),
      setActiveWindowTracking: (val) => set({ activeWindowTracking: val }),
    }),
    {
      name: 'metric-timer-preferences',
    },
  ),
)

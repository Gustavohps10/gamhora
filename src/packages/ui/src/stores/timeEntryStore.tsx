// stores/timeEntryStore.tsx
'use client'

import { IOpenAPI } from '@metric-org/sdk'
import { differenceInSeconds, parseISO, subSeconds } from 'date-fns'
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'

import { useOpenAPI } from '@/hooks'
import { SyncTimeEntryRxDBDTO } from '@/local-db/schemas/time-entries-sync-schema'
import { AppDatabase, useSyncStore } from '@/stores/syncStore'

export interface JournalEntry {
  event: 'started' | 'adjusted' | 'paused' | 'resumed' | 'stopped'
  at: string
  secondsAtEvent: number
  note?: string
}

export interface TimerConfig {
  mode: 'countup' | 'countdown'
  manualInitialSeconds?: number
}

export interface CreateTimeEntryData {
  taskId: string
  activityId: string
  dataSourceId: string
  type: 'increasing' | 'decreasing' | 'manual'
  connectionInstanceId: string
  comments?: string
  userId?: string
  mode?: 'countup' | 'countdown'
  manualInitialSeconds?: number
}

export interface TimeEntryState {
  active: SyncTimeEntryRxDBDTO | null
}

export interface TimeEntryActions {
  setActive: (entry: SyncTimeEntryRxDBDTO | null) => void
  clear: () => void
  createNewTimeEntry: (
    db: AppDatabase,
    data: CreateTimeEntryData,
  ) => Promise<void>
  pauseCurrentTimeEntry: (db: AppDatabase) => Promise<void>
  playCurrentTimeEntry: (db: AppDatabase) => Promise<void>
  stopCurrentTimeEntry: (db: AppDatabase) => Promise<void>
  recoverRunningEntry: (db: AppDatabase) => Promise<void>
}

export type TimeEntryStore = TimeEntryState & TimeEntryActions

// Criação da store focada APENAS em transições de estado, sem interagir com ticks por segundo.
export const createTimeEntryStore = (
  client: IOpenAPI,
): StoreApi<TimeEntryStore> => {
  return createStore<TimeEntryStore>((set, get) => ({
    active: null,

    setActive: (entry) => set({ active: entry }),

    clear: () => set({ active: null }),

    async createNewTimeEntry(db, data) {
      const { active, stopCurrentTimeEntry } = get()

      // If it's a manual entry, we probably don't want to touch the currently running timer
      // since it's just logging past time. If they start a real timer, we stop the current one.
      if (active && data.type !== 'manual') {
        await stopCurrentTimeEntry(db)
      }

      const id = crypto.randomUUID()
      const now = new Date()

      const initialSeconds = data.manualInitialSeconds ?? 0

      if (data.type === 'manual') {
        const startDate = subSeconds(now, initialSeconds).toISOString()
        const finalTimeSpentHours = Number((initialSeconds / 3600).toFixed(4))

        const newEntry: SyncTimeEntryRxDBDTO = {
          _id: `${data.dataSourceId}::local-${id}`,
          id,
          _deleted: false,
          connectionInstanceId: data.connectionInstanceId,
          dataSourceId: data.dataSourceId,
          task: { id: data.taskId },
          activity: { id: data.activityId },
          user: { id: data.userId ?? 'local-user' },
          startDate,
          endDate: now.toISOString(),
          timeSpent: finalTimeSpentHours,
          timeStatus: 'finished',
          type: data.type,
          comments: data.comments,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          journal: [],
        }

        await db.timeEntries.insert(newEntry)
        return // Do NOT call client.timer.start() or set active
      }

      const mode = data.mode ?? 'countup'
      const baseSeconds = data.manualInitialSeconds ?? 0
      const initialElapsed = 0
      const startDate = now.toISOString()
      const eventType = 'started'

      const initialJournal: JournalEntry = {
        event: eventType,
        at: now.toISOString(),
        secondsAtEvent: initialElapsed,
        ...(initialElapsed > 0 && {
          note: `Ajuste manual para ${initialElapsed} segundos`,
        }),
      }

      const newEntry: SyncTimeEntryRxDBDTO = {
        _id: `${data.dataSourceId}::local-${id}`,
        id,
        _deleted: false,
        connectionInstanceId: data.connectionInstanceId,
        dataSourceId: data.dataSourceId,
        task: { id: data.taskId },
        activity: { id: data.activityId },
        user: { id: data.userId ?? 'local-user' },
        startDate,
        timeSpent: 0,
        timeStatus: 'running',
        type: data.type,
        comments: data.comments,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        journal: [initialJournal],
        timerConfig: {
          mode,
          manualInitialSeconds: baseSeconds,
        },
      }

      await db.timeEntries.insert(newEntry)

      // Comunica o backend via IPC para iniciar o processamento pesado do timer
      client.timer.start({
        initialSeconds,
        elapsedSeconds: initialElapsed,
        mode,
      })

      set({ active: newEntry })
    },

    async pauseCurrentTimeEntry(db) {
      const { active } = get()
      if (!active || !active.startDate) return

      const doc = await db.timeEntries.findOne(active._id).exec()
      if (!doc) return

      const now = new Date()
      const currentSeconds = differenceInSeconds(
        now,
        parseISO(active.startDate),
      )

      const updatedJournal = [...(active.journal || [])]
      updatedJournal.push({
        event: 'paused',
        at: now.toISOString(),
        secondsAtEvent: currentSeconds,
      })

      await doc.patch({
        timeStatus: 'paused',
        updatedAt: now.toISOString(),
        journal: updatedJournal,
      })

      client.timer.pause()

      set({
        active: {
          ...active,
          timeStatus: 'paused',
          journal: updatedJournal,
        },
      })
    },

    async playCurrentTimeEntry(db) {
      const { active } = get()
      if (!active) return

      const doc = await db.timeEntries.findOne(active._id).exec()
      if (!doc) return

      const now = new Date()
      const lastPauseEvent = active.journal
        ?.slice()
        .reverse()
        .find((j: JournalEntry) => j.event === 'paused')
      const secondsAtLastPause = lastPauseEvent?.secondsAtEvent ?? 0

      const newStartDate = subSeconds(now, secondsAtLastPause).toISOString()
      const updatedJournal = [...(active.journal || [])]

      updatedJournal.push({
        event: 'resumed',
        at: now.toISOString(),
        secondsAtEvent: secondsAtLastPause,
      })

      await doc.patch({
        timeStatus: 'running',
        startDate: newStartDate,
        updatedAt: now.toISOString(),
        journal: updatedJournal,
      })

      client.timer.resume({
        initialSeconds: active.timerConfig?.manualInitialSeconds ?? 0,
        elapsedSeconds: secondsAtLastPause,
      })

      set({
        active: {
          ...active,
          timeStatus: 'running',
          startDate: newStartDate,
          journal: updatedJournal,
        },
      })
    },

    async stopCurrentTimeEntry(db) {
      const { active } = get()
      if (!active || !active.startDate) return

      const doc = await db.timeEntries.findOne(active._id).exec()
      if (!doc) return

      const now = new Date()
      let currentSeconds = differenceInSeconds(now, parseISO(active.startDate))

      const updatedJournal = [...(active.journal || [])]

      if (active.timeStatus === 'paused') {
        const lastPause = updatedJournal
          .slice()
          .reverse()
          .find((j: JournalEntry) => j.event === 'paused')
        if (lastPause) {
          currentSeconds = lastPause.secondsAtEvent
        }
      } else {
        updatedJournal.push({
          event: 'stopped',
          at: now.toISOString(),
          secondsAtEvent: currentSeconds,
        })
      }

      const base =
        active.timerConfig?.mode === 'countup'
          ? (active.timerConfig?.manualInitialSeconds ?? 0)
          : 0
      const totalSecondsToLog = currentSeconds + base
      const finalTimeSpentHours = Number((totalSecondsToLog / 3600).toFixed(4))

      await doc.patch({
        timeStatus: 'finished',
        endDate: now.toISOString(),
        timeSpent: finalTimeSpentHours,
        updatedAt: now.toISOString(),
        journal: updatedJournal,
      })

      client.timer.stop()

      set({ active: null })
    },

    async recoverRunningEntry(db) {
      const runningDoc = await db.timeEntries
        .findOne({
          selector: { timeStatus: 'running' },
        })
        .exec()

      if (!runningDoc) return

      const activeEntry = runningDoc.toMutableJSON()
      const start = parseISO(activeEntry.startDate!)
      const currentElapsed = differenceInSeconds(new Date(), start)

      const mode = activeEntry.timerConfig?.mode ?? 'countup'

      client.timer.start({
        initialSeconds: activeEntry.timerConfig?.manualInitialSeconds ?? 0,
        elapsedSeconds: currentElapsed,
        mode,
      })

      set({ active: activeEntry })
    },
  }))
}

// ---------------------------------------------------------
// Contexto Absurdamente Simplificado
// ---------------------------------------------------------
const TimeEntryContext = createContext<StoreApi<TimeEntryStore> | null>(null)

export function TimeEntryProvider({ children }: { children: ReactNode }) {
  const client: IOpenAPI = useOpenAPI()
  const db = useSyncStore((s) => s.db)
  const storeRef = useRef<StoreApi<TimeEntryStore> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createTimeEntryStore(client)
  }

  useEffect(() => {
    if (db && storeRef.current) {
      storeRef.current.getState().recoverRunningEntry(db)
    }
  }, [db])

  return (
    <TimeEntryContext.Provider value={storeRef.current}>
      {children}
    </TimeEntryContext.Provider>
  )
}

// ---------------------------------------------------------
// Hook para consumo seguro e performático
// ---------------------------------------------------------
export function useTimeEntryStore<T>(
  selector: (state: TimeEntryStore) => T,
): T {
  const store = useContext(TimeEntryContext)
  if (!store) {
    throw new Error('useTimeEntryStore must be used inside TimeEntryProvider')
  }
  return useStore(store, selector)
}

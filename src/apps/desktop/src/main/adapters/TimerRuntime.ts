import { BrowserWindow, ipcMain } from 'electron'

import { AddonLoader } from '@/main/services/AddonLoader'
import { formatTrayTime, updateTrayTimer } from '@/main/tray'

export class TimerRuntime {
  private intervalId: NodeJS.Timeout | null = null
  private baseSeconds: number = 0
  private elapsedSeconds: number = 0
  private currentSeconds: number = 0
  private mode: 'countup' | 'countdown' = 'countup'
  private status: 'running' | 'paused' | 'idle' = 'idle'
  private addonLoader?: AddonLoader
  private lastActivePayload: any = null

  public init(addonLoader?: AddonLoader): void {
    this.addonLoader = addonLoader
    console.log('✅ [TimerRuntime] init() called')

    ipcMain.on('timer:start', (_event, payload) => {
      const baseSeconds = payload?.baseSeconds ?? payload?.initialSeconds ?? 0
      const elapsedSeconds = payload?.elapsedSeconds ?? 0
      const mode = payload?.mode ?? 'countup'

      console.log('[TimerRuntime] timer:start received', {
        baseSeconds,
        elapsedSeconds,
        mode,
      })

      this.start(baseSeconds, elapsedSeconds, mode)
      this.broadcast('timer:started', {
        baseSeconds,
        elapsedSeconds,
        mode,
      })
    })

    ipcMain.on('timer:pause', () => {
      console.log('[TimerRuntime] timer:pause received')
      this.pause()
      this.broadcast('timer:paused', {
        currentSeconds: this.currentSeconds,
      })
    })

    ipcMain.on('timer:resume', (_event, payload) => {
      const baseSeconds = payload?.baseSeconds ?? payload?.initialSeconds ?? 0
      const elapsedSeconds = payload?.elapsedSeconds ?? 0

      console.log('[TimerRuntime] timer:resume received', {
        baseSeconds,
        elapsedSeconds,
        mode: this.mode,
      })

      this.start(baseSeconds, elapsedSeconds, this.mode)
      this.broadcast('timer:resumed', {
        baseSeconds,
        elapsedSeconds,
        mode: this.mode,
      })
    })

    ipcMain.on('timer:stop', (_event, payload) => {
      console.log('[TimerRuntime] timer:stop received')
      this.stop()
      this.broadcast('timer:stopped', {})

      // Use the cached payload to emit timer:stop to addons!
      if (this.addonLoader && this.lastActivePayload) {
        const workspaceId =
          payload?.workspaceId || this.lastActivePayload.workspaceId
        console.log(
          `[AddonBridge] Emitting timer:stop for workspace ${workspaceId}`,
        )
        this.addonLoader.systemEventEmitter.emit('timer:stop', {
          ...this.lastActivePayload,
          workspaceId,
          currentSeconds: this.currentSeconds,
        })
        this.lastActivePayload = null // clear it
      }
    })

    ipcMain.on('events:broadcast', (_event, payload) => {
      if (payload?.channel) {
        this.broadcast(payload.channel, payload.data)

        // --- ADDON EVENTS BRIDGE ---
        if (this.addonLoader) {
          try {
            if (payload.channel === 'time-entry:sync') {
              const data = payload.data
              if (!data) return // skip if null (like on stop)

              const workspaceId =
                payload.workspaceId ||
                data?.workspaceId ||
                data?.dataSourceId?.split('::')[0]

              const eventPayload = {
                workspaceId,
                timeEntryId: data?.id,
                taskId: data?.taskId || data?.task?.id,
                taskName: data?.taskData?.title || data?.taskData?.name, // fix task name field
                comments: data?.comments || data?.activity?.name,
              }

              const lastJournalEvent =
                data?.journal?.[data.journal.length - 1]?.event

              if (data?.timeStatus === 'running') {
                this.lastActivePayload = eventPayload

                if (
                  lastJournalEvent === 'started' ||
                  lastJournalEvent === 'adjusted' ||
                  !lastJournalEvent
                ) {
                  console.log(
                    `[AddonBridge] Emitting timer:start for workspace ${workspaceId}`,
                  )
                  this.addonLoader.systemEventEmitter.emit('timer:start', {
                    ...eventPayload,
                    mode: data.timerConfig?.mode || 'countup',
                    baseSeconds: data.timerConfig?.manualInitialSeconds || 0,
                  })
                } else if (lastJournalEvent === 'resumed') {
                  console.log(
                    `[AddonBridge] Emitting timer:resume for workspace ${workspaceId}`,
                  )
                  this.addonLoader.systemEventEmitter.emit('timer:resume', {
                    ...eventPayload,
                    currentSeconds: this.currentSeconds,
                  })
                }
              } else if (data?.timeStatus === 'paused') {
                this.lastActivePayload = eventPayload
                console.log(
                  `[AddonBridge] Emitting timer:pause for workspace ${workspaceId}`,
                )
                this.addonLoader.systemEventEmitter.emit('timer:pause', {
                  ...eventPayload,
                  currentSeconds: this.currentSeconds,
                })
              } else if (
                data?.timeStatus === 'updated' &&
                this.lastActivePayload
              ) {
                // Keep the cache updated
                this.lastActivePayload = {
                  ...this.lastActivePayload,
                  ...eventPayload,
                }
                console.log(
                  `[AddonBridge] Emitting timer:update for workspace ${workspaceId}`,
                )
                this.addonLoader.systemEventEmitter.emit(
                  'timer:update',
                  eventPayload,
                )
              }
            } else if (payload.channel === 'timeEntry:created') {
              console.log(`[AddonBridge] Emitting timeEntry:created`)
              this.addonLoader.systemEventEmitter.emit(
                'timeEntry:created',
                payload.data,
              )
            } else if (payload.channel === 'timeEntry:updated') {
              console.log(`[AddonBridge] Emitting timeEntry:updated`)
              this.addonLoader.systemEventEmitter.emit(
                'timeEntry:updated',
                payload.data,
              )
            } else if (payload.channel === 'timeEntry:deleted') {
              console.log(`[AddonBridge] Emitting timeEntry:deleted`)
              this.addonLoader.systemEventEmitter.emit(
                'timeEntry:deleted',
                payload.data,
              )
            }
          } catch (err) {
            console.error('[TimerRuntime] Error emitting addon event:', err)
          }
        }
      }
    })
  }

  public broadcast(channel: string, data?: unknown): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data)
      }
    }
  }

  private formatSeconds(sec: number): string {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m < 100) {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}m`
  }

  private start(
    baseSeconds: number,
    elapsedSeconds: number,
    mode: 'countup' | 'countdown',
  ): void {
    this.stopExisting()

    this.baseSeconds = baseSeconds
    this.elapsedSeconds = elapsedSeconds
    this.mode = mode
    this.status = 'running'

    this.intervalId = setInterval(() => {
      this.elapsedSeconds++

      this.currentSeconds =
        this.mode === 'countup'
          ? this.baseSeconds + this.elapsedSeconds
          : this.baseSeconds - this.elapsedSeconds

      // Atualiza o Tray com o formato correto de horas/minutos/segundos
      updateTrayTimer({
        elapsedText: formatTrayTime(this.currentSeconds),
        status: this.status,
      }).catch(console.error)

      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          win.webContents.send('timer:tick', { seconds: this.currentSeconds })
        }
      }

      // Removed auto-stop for countdown so it can go negative
    }, 1000)
  }

  private stopExisting(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private pause(): void {
    console.log('[TimerRuntime] pause()', {
      currentSeconds: this.currentSeconds,
    })

    this.stopExisting()
    this.status = 'paused'
    updateTrayTimer({
      elapsedText: formatTrayTime(this.currentSeconds),
      status: 'paused',
    }).catch(console.error)
  }

  private stop(): void {
    console.log('[TimerRuntime] stop()', {
      previousSeconds: this.currentSeconds,
    })

    this.stopExisting()
    this.currentSeconds = 0
    this.status = 'idle'
    updateTrayTimer({
      elapsedText: formatTrayTime(0),
      status: 'idle',
    }).catch(console.error)

    console.log('[TimerRuntime] reset currentSeconds to 0')
  }
}

export const timerRuntime = new TimerRuntime()

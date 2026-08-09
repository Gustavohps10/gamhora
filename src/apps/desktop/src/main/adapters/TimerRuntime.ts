import { BrowserWindow, ipcMain } from 'electron'

import { formatTrayTime, updateTrayTimer } from '@/main/tray'

export class TimerRuntime {
  private intervalId: NodeJS.Timeout | null = null
  private currentSeconds: number = 0
  private mode: 'countup' | 'countdown' = 'countup'
  private status: 'running' | 'paused' | 'idle' = 'idle'

  public init(): void {
    console.log('[TimerRuntime] init() called')

    ipcMain.on('timer:start', (event, { initialSeconds, mode }) => {
      console.log('[TimerRuntime] timer:start received', {
        initialSeconds,
        mode,
      })

      this.start(initialSeconds, mode)
    })

    ipcMain.on('timer:pause', () => {
      console.log('[TimerRuntime] timer:pause received')
      this.pause()
    })

    ipcMain.on('timer:resume', (event, { initialSeconds }) => {
      console.log('[TimerRuntime] timer:resume received', {
        initialSeconds,
        mode: this.mode,
      })

      this.start(initialSeconds, this.mode)
    })

    ipcMain.on('timer:stop', () => {
      console.log('[TimerRuntime] timer:stop received')
      this.stop()
    })
  }

  private formatSeconds(sec: number): string {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m < 100) {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}m`
  }

  private start(initialSeconds: number, mode: 'countup' | 'countdown'): void {
    this.stopExisting()

    this.currentSeconds = initialSeconds
    this.mode = mode
    this.status = 'running'

    this.intervalId = setInterval(() => {
      if (this.mode === 'countup') {
        this.currentSeconds++
      } else {
        this.currentSeconds--
      }

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

      if (this.mode === 'countdown' && this.currentSeconds <= 0) {
        this.stopExisting()

        for (const win of BrowserWindow.getAllWindows()) {
          if (!win.isDestroyed()) {
            win.webContents.send('timer:finished')
          }
        }
      }
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

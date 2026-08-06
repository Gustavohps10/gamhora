import { ipcMain } from 'electron'

export class TimerRuntime {
  private intervalId: NodeJS.Timeout | null = null
  private currentSeconds: number = 0
  private mode: 'countup' | 'countdown' = 'countup'

  public init(): void {
    console.log('[TimerRuntime] init() called')

    ipcMain.on('timer:start', (event, { initialSeconds, mode }) => {
      console.log('[TimerRuntime] timer:start received', {
        initialSeconds,
        mode,
      })

      this.start(event.sender, initialSeconds, mode)
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

      this.start(event.sender, initialSeconds, this.mode)
    })

    ipcMain.on('timer:stop', () => {
      console.log('[TimerRuntime] timer:stop received')
      this.stop()
    })
  }

  private start(
    sender: Electron.WebContents,
    initialSeconds: number,
    mode: 'countup' | 'countdown',
  ): void {
    console.log('[TimerRuntime] start()', { initialSeconds, mode })

    this.stopExisting()

    this.currentSeconds = initialSeconds
    this.mode = mode

    console.log('[TimerRuntime] timer initialized', {
      currentSeconds: this.currentSeconds,
      mode: this.mode,
    })

    this.intervalId = setInterval(() => {
      if (this.mode === 'countup') {
        this.currentSeconds++
      } else {
        this.currentSeconds--
      }

      console.log('[TimerRuntime] tick', {
        seconds: this.currentSeconds,
        mode: this.mode,
      })

      sender.send('timer:tick', { seconds: this.currentSeconds })

      if (this.mode === 'countdown' && this.currentSeconds <= 0) {
        console.log('[TimerRuntime] countdown finished')

        this.stopExisting()
        sender.send('timer:finished')
      }
    }, 1000)
  }

  private pause(): void {
    console.log('[TimerRuntime] pause()', {
      currentSeconds: this.currentSeconds,
    })

    this.stopExisting()
  }

  private stop(): void {
    console.log('[TimerRuntime] stop()', {
      previousSeconds: this.currentSeconds,
    })

    this.stopExisting()
    this.currentSeconds = 0

    console.log('[TimerRuntime] reset currentSeconds to 0')
  }

  private stopExisting(): void {
    if (this.intervalId) {
      console.log('[TimerRuntime] clearing interval')

      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export const timerRuntime = new TimerRuntime()

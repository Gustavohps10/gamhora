export interface ActiveTimeEntryDTO {
  id: string
  taskId?: string
  comments?: string
  activityId?: string
  dataSourceId?: string
  connectionInstanceId?: string
  startDate?: string
  endDate?: string
  status: 'running' | 'paused' | 'stopped'
  elapsedSeconds: number
  pauseSeconds: number
}

export interface StartTimerPayload {
  taskId?: string
  comments?: string
  activityId?: string
  dataSourceId?: string
  connectionInstanceId?: string
  mode?: 'countup' | 'countdown'
  initialSeconds?: number
}

export interface DirectLogPayload {
  taskId: string
  timeSpentSeconds: number
  comments?: string
  activityId?: string
  date?: string
}

export interface ITimerAPI {
  getActiveEntry(): Promise<ActiveTimeEntryDTO | null>
  requestControlLock(): Promise<boolean>
  releaseControlLock(): Promise<void>
  isControlLockHeld(): Promise<boolean>
  start(payload?: StartTimerPayload): Promise<void>
  pause(): Promise<void>
  stop(): Promise<void>
  logTime(payload: DirectLogPayload): Promise<void>
}

export interface TimeEntryItemDTO {
  id: string
  taskId?: string
  comments?: string
  activityId?: string
  dataSourceId?: string
  connectionInstanceId?: string
  startDate?: string
  endDate?: string
  timeSpentSeconds: number
  pauseSeconds: number
  status?: 'running' | 'paused' | 'finished' | 'suggestion'
  source?: 'manual' | 'timer' | 'ai_suggestion' | 'addon'
  addonSource?: { id: string; name: string; imageUrl?: string }
  createdAt: string
  updatedAt?: string
}

export interface CreateTimeEntryDTO {
  taskId: string
  timeSpentSeconds: number
  comments?: string
  activityId?: string
  dataSourceId?: string
  connectionInstanceId?: string
  startDate?: string
  endDate?: string
  pauseSeconds?: number
  status?: 'finished' | 'suggestion'
  source?: 'manual' | 'timer' | 'ai_suggestion' | 'addon'
}

export interface UpdateTimeEntryDTO {
  taskId?: string
  comments?: string
  activityId?: string
  timeSpentSeconds?: number
  pauseSeconds?: number
  endDate?: string
  status?: 'finished' | 'suggestion'
}

export interface ITimeEntriesAPI {
  list(filter?: {
    date?: string
    taskId?: string
    status?: 'finished' | 'suggestion' | 'all'
  }): Promise<TimeEntryItemDTO[]>
  getById(id: string): Promise<TimeEntryItemDTO | null>
  create(payload: CreateTimeEntryDTO): Promise<TimeEntryItemDTO>
  createSuggestion(payload: CreateTimeEntryDTO): Promise<TimeEntryItemDTO>
  acceptSuggestion(id: string): Promise<TimeEntryItemDTO>
  dismissSuggestion(id: string): Promise<boolean>
  update(id: string, payload: UpdateTimeEntryDTO): Promise<TimeEntryItemDTO>
  delete(id: string): Promise<boolean>
}

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
}

export interface UpdateTimeEntryDTO {
  taskId?: string
  comments?: string
  activityId?: string
  timeSpentSeconds?: number
  pauseSeconds?: number
  endDate?: string
}

export interface ITimeEntriesAPI {
  list(filter?: { date?: string; taskId?: string }): Promise<TimeEntryItemDTO[]>
  getById(id: string): Promise<TimeEntryItemDTO | null>
  create(payload: CreateTimeEntryDTO): Promise<TimeEntryItemDTO>
  update(id: string, payload: UpdateTimeEntryDTO): Promise<TimeEntryItemDTO>
  delete(id: string): Promise<boolean>
}

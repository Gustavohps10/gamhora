import { RxJsonSchema } from 'rxdb'

import { SyncTaskRxDBDTO } from '@/local-db/schemas/tasks-sync-schema'

// ─────────────────────────────────────────────
// Journal — histórico local de eventos do timer
// Nunca sincronizado com datasources externos
// ─────────────────────────────────────────────

export type TimerJournalEvent =
  | 'started' // Timer iniciado do zero pelo usuário
  | 'adjusted' // Timer iniciado com tempo manual (startDate retroativo)
  | 'paused' // Timer pausado pelo usuário
  | 'resumed' // Timer retomado após pausa
  | 'stopped' // Timer encerrado definitivamente

export interface TimerJournalEntry {
  event: TimerJournalEvent
  at: string // ISO datetime — momento exato do evento
  secondsAtEvent: number // Segundos acumulados no momento do evento
  note?: string // Observação livre (ex: "Usuário definiu 6h manualmente")
}

// ─────────────────────────────────────────────
// TimerConfig — configuração local do timer
// Nunca sincronizado com datasources externos
// ─────────────────────────────────────────────

export type TimerMode = 'countup' | 'countdown'

export interface TimerConfig {
  mode: TimerMode
  manualInitialSeconds?: number // Offset manual definido pelo usuário no início
}

// ─────────────────────────────────────────────
// SyncTimeEntryRxDBDTO
// ─────────────────────────────────────────────

export interface SyncTimeEntryRxDBDTO {
  // ── Campos sincronizados ──────────────────────
  _id: string
  _deleted: boolean
  dataSourceId: string
  connectionInstanceId: string
  id: string
  task: { id: string }
  taskData?: SyncTaskRxDBDTO
  activity: { id: string; name?: string }
  user: { id: string; name?: string }

  /**
   * Âncora temporal do timer.
   *
   * Representa o ponto a partir do qual `now - startDate` retorna
   * os segundos acumulados corretamente. Em casos de tempo inicial
   * manual ou retomada após pausa, é recalculado retroativamente
   * como `now - secondsAtMoment`.
   *
   * Não representa necessariamente o momento real em que o trabalho
   * foi iniciado — consulte o journal para o histórico completo.
   */
  startDate?: string

  /**
   * Preenchido no stop pelo renderer.
   * Enviado ao datasource externo via adapter no push manual.
   */
  endDate?: string

  /**
   * Tempo acumulado em horas.
   * Calculado localmente pelo renderer a partir dos segundos
   * acumulados durante a sessão. Enviado ao datasource externo
   * no push via adapter.
   */
  timeSpent: number

  comments?: string
  createdAt: string
  updatedAt: string
  timeStatus?: 'running' | 'paused' | 'finished' | 'suggestion'
  source?: 'manual' | 'timer' | 'ai_suggestion' | 'addon'
  type?: 'increasing' | 'decreasing' | 'manual'
  conflicted?: boolean
  conflictData?: { server?: any; local?: any }
  validationError?: any

  syncedAt?: string
  assumedMasterState?: any

  // ── Campos locais (nunca sincronizados) ───────

  /**
   * Histórico de eventos do timer para este apontamento.
   * Permite auditoria, recálculo e exibição de histórico ao usuário.
   * Excluído da estratégia de replicação — dado exclusivamente local.
   */
  journal?: TimerJournalEntry[]

  /**
   * Configuração do timer para este apontamento específico.
   * Excluído da estratégia de replicação — dado exclusivamente local.
   */
  timerConfig?: TimerConfig
}

// ─────────────────────────────────────────────
// Schema RxDB
// ─────────────────────────────────────────────

export const timeEntriesSyncSchema: RxJsonSchema<SyncTimeEntryRxDBDTO> = {
  title: 'timeEntries schema',
  version: 0,
  description:
    'Time entries with sync metadata, task relation, local journal and timer config',
  type: 'object',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string', maxLength: 200 },
    _deleted: { type: 'boolean' },
    dataSourceId: { type: 'string', maxLength: 100 },
    connectionInstanceId: { type: 'string', maxLength: 100 },
    id: { type: 'string', maxLength: 100 },
    task: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    taskData: {
      type: 'object',
    },
    activity: {
      type: 'object',
      properties: { id: { type: 'string' }, name: { type: 'string' } },
      required: ['id'],
    },
    user: {
      type: 'object',
      properties: { id: { type: 'string' }, name: { type: 'string' } },
      required: ['id'],
    },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    timeSpent: { type: 'number' },
    comments: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    conflicted: { type: 'boolean' },
    conflictData: {
      type: 'object',
      properties: {
        server: { type: 'object' },
        local: { type: 'object' },
      },
    },
    validationError: { type: 'object' },
    syncedAt: { type: 'string', format: 'date-time' },
    assumedMasterState: { type: 'object' },
    timeStatus: {
      type: 'string',
      enum: ['running', 'paused', 'finished', 'suggestion'],
    },
    source: {
      type: 'string',
      enum: ['manual', 'timer', 'ai_suggestion', 'addon'],
    },
    type: {
      type: 'string',
      enum: ['increasing', 'decreasing', 'manual'],
    },

    // ── Campos locais ─────────────────────────────
    journal: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          event: {
            type: 'string',
            enum: ['started', 'adjusted', 'paused', 'resumed', 'stopped'],
          },
          at: { type: 'string', format: 'date-time' },
          secondsAtEvent: { type: 'number' },
          note: { type: 'string' },
        },
        required: ['event', 'at', 'secondsAtEvent'],
      },
    },
    timerConfig: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['countup', 'countdown'],
        },
        manualInitialSeconds: { type: 'number' },
      },
      required: ['mode'],
    },
  },
  required: [
    '_id',
    'dataSourceId',
    'id',
    'task',
    'activity',
    'user',
    'timeSpent',
    'createdAt',
    'updatedAt',
  ],
}

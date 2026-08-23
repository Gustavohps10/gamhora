import { ICredentialsStorage } from '@metric-org/application'
import {
  AddonContext,
  AddonSettingsField,
  CommandHandler,
  IAddon,
  IAddonEventsAPI,
  IAddonStorage,
  ICommandRegistry,
  IDataSource,
  IDataSourceRegistry,
  IMenusRegistry,
  INotificationService,
  IRegistry,
  ITimeEntriesAPI,
  ITimerAPI,
  SidebarMenuItem,
  TimerbarMenuItem,
} from '@metric-org/sdk'
import { IEventEmitter, ISystemEvents } from '@metric-org/shared/transport'
import { BrowserWindow } from 'electron'

export class MemoryRegistry<T extends { id: string }> implements IRegistry<T> {
  private items = new Map<string, T>()

  register(item: T): void {
    if (item && item.id) {
      this.items.set(item.id, item)
    }
  }

  unregister(id: string): void {
    this.items.delete(id)
  }

  getItems(): T[] {
    return Array.from(this.items.values())
  }
}

export class CommandRegistry implements ICommandRegistry {
  private handlers = new Map<string, CommandHandler>()

  register(id: string, handler: CommandHandler): void {
    this.handlers.set(id, handler)
  }

  unregister(id: string): void {
    this.handlers.delete(id)
  }

  async execute(id: string, ...args: any[]): Promise<any> {
    const handler = this.handlers.get(id)
    if (!handler) {
      throw new Error(`Comando '${id}' não encontrado.`)
    }
    return await handler(...args)
  }

  getItems(): Array<{ id: string }> {
    return Array.from(this.handlers.keys()).map((id) => ({ id }))
  }
}

export class SimpleEventEmitter<
  TEvents extends Record<string, any>,
> implements IEventEmitter<TEvents> {
  private listeners = new Map<string, Set<(payload: any) => void>>()

  on<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): () => void {
    const key = String(event)
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(handler)
    return () => this.off(event, handler)
  }

  once<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): void {
    const wrapper = (payload: TEvents[K]) => {
      this.off(event, wrapper)
      handler(payload)
    }
    this.on(event, wrapper)
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const key = String(event)
    const set = this.listeners.get(key)
    if (set) {
      set.forEach((fn) => {
        try {
          fn(payload)
        } catch (err) {
          console.error(`Erro ao disparar evento ${String(event)}:`, err)
        }
      })
    }
  }

  off<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): void {
    const key = String(event)
    const set = this.listeners.get(key)
    if (set) {
      set.delete(handler)
    }
  }
}

export interface ActiveAddonInfo {
  addonId: string
  instance: IAddon
}

export class AddonEventEmitter
  extends SimpleEventEmitter<ISystemEvents>
  implements IAddonEventsAPI
{
  onTimerStart(callback: (payload: ISystemEvents['timer:start']) => void) {
    return this.on('timer:start', callback)
  }
  onTimerPause(callback: (payload: ISystemEvents['timer:pause']) => void) {
    return this.on('timer:pause', callback)
  }
  onTimerResume(callback: (payload: ISystemEvents['timer:resume']) => void) {
    return this.on('timer:resume', callback)
  }
  onTimerStop(callback: (payload: ISystemEvents['timer:stop']) => void) {
    return this.on('timer:stop', callback)
  }
  onTimerUpdate(callback: (payload: ISystemEvents['timer:update']) => void) {
    return this.on('timer:update', callback)
  }
  onSystemIdle(callback: (payload: ISystemEvents['system:idle']) => void) {
    return this.on('system:idle', callback)
  }
  onSystemActive(callback: (payload: ISystemEvents['system:active']) => void) {
    return this.on('system:active', callback)
  }
  onTimeEntryCreated(
    callback: (payload: ISystemEvents['timeEntry:created']) => void,
  ) {
    return this.on('timeEntry:created', callback)
  }
  onTimeEntryUpdated(
    callback: (payload: ISystemEvents['timeEntry:updated']) => void,
  ) {
    return this.on('timeEntry:updated', callback)
  }
  onTimeEntryDeleted(
    callback: (payload: ISystemEvents['timeEntry:deleted']) => void,
  ) {
    return this.on('timeEntry:deleted', callback)
  }
  onWorkspaceChange(
    callback: (payload: ISystemEvents['workspace:changed']) => void,
  ) {
    return this.on('workspace:changed', callback)
  }
}

export class AddonLoader {
  private activeAddons = new Map<string, ActiveAddonInfo>()
  private activeTimerControllerAddonId: string | null = null
  private toastListeners: Array<(toastData: any) => void> = []

  public readonly sidebarRegistry = new MemoryRegistry<SidebarMenuItem>()
  private addonTimerbarItems = new Map<string, TimerbarMenuItem>()
  public readonly dataSourceRegistry: IDataSourceRegistry =
    new MemoryRegistry<IDataSource>()
  public readonly commandRegistry = new CommandRegistry()
  public readonly systemEventEmitter = new AddonEventEmitter()

  constructor(private credentialsStorage: ICredentialsStorage) {}

  public showToast(
    type: 'info' | 'success' | 'warning' | 'error' | 'loading',
    message: string,
    title?: string,
    toastId?: string,
  ): string {
    const generatedId =
      toastId ||
      `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const toastData = {
      action: 'show',
      type,
      message,
      title,
      toastId: generatedId,
    }
    console.log(
      `🔔 [AddonLoader] Broadcasting toast [${type}]: "${message}" (${title ?? ''})`,
    )
    this.toastListeners.forEach((listener) => listener(toastData))

    try {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('addons:toast', toastData)
        }
      })
    } catch (err) {
      console.error('❌ [AddonLoader] Erro ao enviar IPC de toast:', err)
    }

    return generatedId
  }

  public dismissToast(toastId: string): void {
    const toastData = { action: 'dismiss', toastId }
    console.log(`🔔 [AddonLoader] Dismissing toast: ${toastId}`)
    this.toastListeners.forEach((listener) => listener(toastData))

    try {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send('addons:toast', toastData)
        }
      })
    } catch (err) {
      console.error(
        '❌ [AddonLoader] Erro ao enviar IPC de dismiss toast:',
        err,
      )
    }
  }

  public onToast(listener: (toastData: any) => void): () => void {
    this.toastListeners.push(listener)
    return () => {
      this.toastListeners = this.toastListeners.filter((l) => l !== listener)
    }
  }

  private activeWorkspaceId: string | null = null

  public setActiveWorkspace(workspaceId: string): void {
    if (workspaceId && workspaceId !== this.activeWorkspaceId) {
      const previousWorkspaceId = this.activeWorkspaceId
      this.activeWorkspaceId = workspaceId
      console.log(
        `[AddonLoader] 🔄 Workspace alterado de "${previousWorkspaceId || 'Nenhum'}" para "${workspaceId}"`,
      )
      this.systemEventEmitter.emit('workspace:changed', {
        previousWorkspaceId: previousWorkspaceId || undefined,
        currentWorkspaceId: workspaceId,
      })
    }
  }

  public createContext(addonId: string): AddonContext {
    const storage: IAddonStorage = {
      get: async (key: string) => {
        if (!this.activeWorkspaceId) return null
        const workspaceId = this.activeWorkspaceId
        const masterKey = `ws_${workspaceId}_config`
        const raw = await this.credentialsStorage.getToken(addonId, masterKey)
        if (!raw) return null
        try {
          const data = JSON.parse(raw)
          if (data && typeof data === 'object' && key in data) {
            return data[key]
          }
        } catch {
          // ignore
        }
        return null
      },
      set: async (key: string, value: string) => {
        if (!this.activeWorkspaceId) return
        const workspaceId = this.activeWorkspaceId
        const masterKey = `ws_${workspaceId}_config`
        let data: Record<string, string> = {}
        const raw = await this.credentialsStorage.getToken(addonId, masterKey)
        if (raw) {
          try {
            data = JSON.parse(raw) || {}
          } catch {
            data = {}
          }
        }
        data[key] = value
        await this.credentialsStorage.saveToken(
          addonId,
          masterKey,
          JSON.stringify(data),
        )
      },
      delete: async (key: string) => {
        if (!this.activeWorkspaceId) return
        const workspaceId = this.activeWorkspaceId
        const masterKey = `ws_${workspaceId}_config`
        const raw = await this.credentialsStorage.getToken(addonId, masterKey)
        if (raw) {
          try {
            const data = JSON.parse(raw) || {}
            delete data[key]
            if (Object.keys(data).length > 0) {
              await this.credentialsStorage.saveToken(
                addonId,
                masterKey,
                JSON.stringify(data),
              )
            } else {
              await this.credentialsStorage.deleteToken(addonId, masterKey)
            }
          } catch {
            await this.credentialsStorage.deleteToken(addonId, masterKey)
          }
        }
      },
    }

    const addonTimerbarRegistry: IRegistry<TimerbarMenuItem> = {
      register: (item: TimerbarMenuItem) => {
        // Restrição Estrutural: Cada addon possui no máximo 1 item na Timerbar
        const itemWithAddon = { ...item, addonId }
        this.addonTimerbarItems.set(addonId, itemWithAddon)
      },
      unregister: (_id: string) => {
        this.addonTimerbarItems.delete(addonId)
      },
      getItems: () => {
        const item = this.addonTimerbarItems.get(addonId)
        return item ? [item] : []
      },
    }

    const menusRegistry: IMenusRegistry = {
      sidebar: this.sidebarRegistry,
      timerbar: addonTimerbarRegistry,
    }

    const notifications: INotificationService = {
      info: async (message, title) => this.showToast('info', message, title),
      success: async (message, title) =>
        this.showToast('success', message, title),
      warning: async (message, title) =>
        this.showToast('warning', message, title),
      error: async (message, title) => this.showToast('error', message, title),
      loading: async (message, title) =>
        this.showToast('loading', message, title),
      dismiss: async (toastId) => this.dismissToast(toastId),
    }

    const timer: ITimerAPI = {
      getActiveEntry: async () => null,
      requestControlLock: async () => {
        if (
          this.activeTimerControllerAddonId === null ||
          this.activeTimerControllerAddonId === addonId
        ) {
          this.activeTimerControllerAddonId = addonId
          return true
        }
        return false
      },
      releaseControlLock: async () => {
        if (this.activeTimerControllerAddonId === addonId) {
          this.activeTimerControllerAddonId = null
        }
      },
      isControlLockHeld: async () => {
        return this.activeTimerControllerAddonId === addonId
      },
      start: async (payload) => {
        if (
          this.activeTimerControllerAddonId &&
          this.activeTimerControllerAddonId !== addonId
        ) {
          throw new Error(
            `[TimerAPI] Controle exclusivo retido pelo addon ${this.activeTimerControllerAddonId}`,
          )
        }
        console.log(
          `⏱️ [TimerAPI] Iniciar timer por addon ${addonId}:`,
          payload,
        )
      },
      pause: async () => {
        if (
          this.activeTimerControllerAddonId &&
          this.activeTimerControllerAddonId !== addonId
        ) {
          throw new Error(
            `[TimerAPI] Controle exclusivo retido pelo addon ${this.activeTimerControllerAddonId}`,
          )
        }
        console.log(`⏱️ [TimerAPI] Pausar timer por addon ${addonId}`)
      },
      stop: async () => {
        if (
          this.activeTimerControllerAddonId &&
          this.activeTimerControllerAddonId !== addonId
        ) {
          throw new Error(
            `[TimerAPI] Controle exclusivo retido pelo addon ${this.activeTimerControllerAddonId}`,
          )
        }
        console.log(`⏱️ [TimerAPI] Parar timer por addon ${addonId}`)
      },
      logTime: async (payload) => {
        if (payload.timeSpentSeconds <= 0) {
          throw new Error(
            '[TimerAPI] Apontamento não pode ser menor ou igual a zero.',
          )
        }
        if (payload.timeSpentSeconds > 86400) {
          throw new Error(
            '[TimerAPI] Apontamento não pode exceder 24h (86400s).',
          )
        }
        console.log(`⏱️ [TimerAPI] Lançar horas por addon ${addonId}:`, payload)
      },
    }

    const timeEntries: ITimeEntriesAPI = {
      list: async () => [],
      getById: async () => null,
      create: async (payload) => {
        if (payload.timeSpentSeconds <= 0) {
          throw new Error('[TimeEntriesAPI] Duração inválida.')
        }
        return {
          id: `entry_${Date.now()}`,
          taskId: payload.taskId,
          comments: payload.comments,
          timeSpentSeconds: payload.timeSpentSeconds,
          pauseSeconds: payload.pauseSeconds ?? 0,
          status: payload.status ?? 'finished',
          source: payload.source ?? 'addon',
          createdAt: new Date().toISOString(),
        }
      },
      createSuggestion: async (payload) => {
        const now = new Date()
        const nowIso = now.toISOString()

        const endDate = payload.endDate || nowIso
        let startDate = payload.startDate

        if (!startDate) {
          const seconds = payload.timeSpentSeconds || 0
          startDate = new Date(
            new Date(endDate).getTime() - seconds * 1000,
          ).toISOString()
        }

        let timeSpentSeconds = payload.timeSpentSeconds
        if (!timeSpentSeconds && startDate && endDate) {
          timeSpentSeconds = Math.max(
            0,
            Math.round(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                1000,
            ),
          )
        }

        if (timeSpentSeconds <= 0) {
          throw new Error('[TimeEntriesAPI] Duração inválida.')
        }

        const addonSource = this.getAddonSourceInfo(addonId)

        console.log(
          `🤖 [TimeEntriesAPI] Sugestão de apontamento criada por addon ${addonId}:`,
          payload,
        )
        const item = {
          id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          taskId: payload.taskId,
          comments: payload.comments,
          startDate,
          endDate,
          timeSpentSeconds,
          pauseSeconds: payload.pauseSeconds ?? 0,
          status: 'suggestion' as const,
          source: payload.source ?? 'ai_suggestion',
          addonSource,
          createdAt: nowIso,
        }

        try {
          const windows = BrowserWindow.getAllWindows()
          windows.forEach((win) => {
            if (!win.isDestroyed()) {
              win.webContents.send('addons:suggestion-created', item)
            }
          })
        } catch (err) {
          console.error('❌ [AddonLoader] Erro ao enviar IPC de sugestão:', err)
        }

        return item
      },
      acceptSuggestion: async (id) => {
        console.log(`✅ [TimeEntriesAPI] Sugestão aceita: ${id}`)
        return {
          id,
          timeSpentSeconds: 3600,
          pauseSeconds: 0,
          status: 'finished',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      dismissSuggestion: async (id) => {
        console.log(`🗑️ [TimeEntriesAPI] Sugestão descartada: ${id}`)
        return true
      },
      update: async (id, payload) => {
        if (payload.pauseSeconds !== undefined && payload.pauseSeconds < 0) {
          throw new Error(
            '[TimeEntriesAPI] Tempo de pausa não pode ser negativo.',
          )
        }
        return {
          id,
          timeSpentSeconds: payload.timeSpentSeconds ?? 3600,
          pauseSeconds: payload.pauseSeconds ?? 0,
          status: payload.status ?? 'finished',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      delete: async () => true,
    }

    return {
      addonId,
      commands: this.commandRegistry,
      menus: menusRegistry,
      dataSources: this.dataSourceRegistry,
      events: this.systemEventEmitter,
      notifications,
      timer,
      timeEntries,
      storage,
    }
  }

  public async activateAddon(
    addonId: string,
    addonInstance: IAddon,
  ): Promise<void> {
    const context = this.createContext(addonId)
    await addonInstance.activate(context)
    this.activeAddons.set(addonId, { addonId, instance: addonInstance })
    console.log(`✅ [AddonLoader] Addon ativado com sucesso: ${addonId}`)
  }

  public async deactivateAddon(addonId: string): Promise<void> {
    const item = this.activeAddons.get(addonId)
    if (item && item.instance.deactivate) {
      await item.instance.deactivate()
    }
    this.activeAddons.delete(addonId)
  }

  public async getSettingsSchema(
    addonId: string,
  ): Promise<AddonSettingsField[]> {
    const item = this.activeAddons.get(addonId)
    if (!item?.instance?.getSettingsSchema) return []
    return await item.instance.getSettingsSchema()
  }

  public async executeAction(
    addonId: string,
    actionId: string,
    payload?: unknown,
  ): Promise<unknown> {
    const item = this.activeAddons.get(addonId)
    if (!item?.instance?.executeAction) return null
    if (payload && typeof payload === 'object' && 'workspaceId' in payload) {
      const wsId = (payload as { workspaceId?: string }).workspaceId
      if (wsId) {
        this.setActiveWorkspace(wsId)
      }
    }
    return await item.instance.executeAction(actionId, payload)
  }

  public async initializeDevAddons(): Promise<void> {
    try {
      const redmineModule = await import('@metric-org/redmine-for-tests')
      const Redmine4Test = redmineModule.default
      if (Redmine4Test && typeof Redmine4Test === 'function') {
        const addonInstance = new (Redmine4Test as new () => IAddon)()
        await this.activateAddon('@timelapse/redmine-plugin', addonInstance)
      }
    } catch (err) {
      console.error(
        '❌ [AddonLoader] Erro ao carregar addon Redmine4Test:',
        err,
      )
    }

    try {
      const aiModule = await import('@metric-org/metric-ai-for-tests')
      const MetricAI4Test = aiModule.default
      if (MetricAI4Test && typeof MetricAI4Test === 'function') {
        const addonInstance = new (MetricAI4Test as new () => IAddon)()
        await this.activateAddon(
          '@metric-org/metric-ai-for-tests',
          addonInstance,
        )
      }
    } catch (err) {
      console.error(
        '❌ [AddonLoader] Erro ao carregar addon MetricAI4Test:',
        err,
      )
    }

    try {
      const watcherModule = await import('@metric-org/fake-watcher-for-tests')
      const FakeWatcherAddon = watcherModule.default
      if (FakeWatcherAddon && typeof FakeWatcherAddon === 'function') {
        const addonInstance = new (FakeWatcherAddon as new () => IAddon)()
        await this.activateAddon(
          '@metric-org/fake-watcher-for-tests',
          addonInstance,
        )
      }
    } catch (err) {
      console.error(
        '❌ [AddonLoader] Erro ao carregar addon FakeWatcherForTests:',
        err,
      )
    }

    try {
      const discordModule = await import('@metric-org/discord-for-tests')
      const DiscordAddon = discordModule.default
      if (DiscordAddon && typeof DiscordAddon === 'function') {
        const addonInstance = new (DiscordAddon as new () => IAddon)()
        await this.activateAddon('@metric-org/discord-for-tests', addonInstance)
      }
    } catch (err) {
      console.error(
        '❌ [AddonLoader] Erro ao carregar addon DiscordForTests:',
        err,
      )
    }
  }

  public getSidebarMenus(): SidebarMenuItem[] {
    return this.sidebarRegistry.getItems()
  }

  public getTimerbarMenus(): TimerbarMenuItem[] {
    return Array.from(this.addonTimerbarItems.values())
  }

  public getDataSource(dataSourceId: string): IDataSource | undefined {
    return this.dataSourceRegistry
      .getItems()
      .find((ds) => ds.id === dataSourceId)
  }

  public async executeCommand(commandId: string, ...args: any[]): Promise<any> {
    return await this.commandRegistry.execute(commandId, ...args)
  }

  private getAddonSourceInfo(addonId: string): {
    id: string
    name: string
    imageUrl?: string
  } {
    const active = this.activeAddons.get(addonId)
    const meta = active?.instance?.metadata

    const name = meta?.name || addonId.split('/').pop() || addonId
    const imageUrl = meta?.iconUrl

    return {
      id: addonId,
      name,
      imageUrl,
    }
  }
}

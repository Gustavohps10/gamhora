import {
  AddonContext,
  CommandHandler,
  IAddon,
  ICommandRegistry,
  IDataSource,
  IDataSourceRegistry,
  IMenusRegistry,
  IRegistry,
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

import {
  AddonContext,
  IAddon,
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

export interface ActiveAddonInfo {
  addonId: string
  instance: IAddon
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
  public readonly systemEventEmitter = new SimpleEventEmitter<ISystemEvents>()

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

  public createContext(addonId: string): AddonContext {
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
          createdAt: new Date().toISOString(),
        }
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
}

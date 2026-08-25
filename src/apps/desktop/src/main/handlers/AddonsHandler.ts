import {
  AddonManifest,
  FileData,
  IAddonsFacade,
  IImportAddonUseCase,
} from '@metric-org/application'
import { AddonSettingsSchema } from '@metric-org/sdk'
import { createResponseViewModel } from '@metric-org/shared/helpers'
import {
  IEventEmitter,
  IJobEvents,
  IJobResult,
  IRequest,
} from '@metric-org/shared/transport'
import {
  AddonInstallerViewModel,
  AddonManifestViewModel,
  AddonThemeViewModel,
  PaginatedViewModel,
  ViewModel,
} from '@metric-org/shared/view-models'
import { app, type IpcMainInvokeEvent } from 'electron'

import { HandlerBase } from '@/main/handlers/HandlerBase'
import {
  FAKE_DATASOURCE_ADDON_ID,
  REDMINE4TEST_ADDON_ID,
} from '@/main/resolvers/data-source-resolver'

const DEV_FAKE_MANIFEST: AddonManifest = {
  id: FAKE_DATASOURCE_ADDON_ID,
  name: 'DataSource Fake (Testes)',
  creator: 'Metric',
  description:
    'Datasource mock com 1000 tarefas e 1000 apontamentos locais para testes e validação de envio de dados.',
  path: '',
  logo: '',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'DataSources',
  tags: ['teste', 'mock', 'desenvolvimento'],
}

const DEV_REDMINE_MANIFEST: AddonManifest = {
  id: REDMINE4TEST_ADDON_ID,
  name: 'Redmine (Oficial)',
  creator: 'Metric',
  description: 'Conector Redmine para testes.',
  path: '',
  logo: 'https://raw.githubusercontent.com/Gustavohps10/redmine-plugin/main/src/icon.png',
  downloads: 0,
  version: '1.0.3',
  stars: 0,
  installed: true,
  category: 'DataSources',
  tags: ['redmine', 'datasource', 'theme', 'tema', 'teste'],
}

const DEV_METRIC_AI_MANIFEST: AddonManifest = {
  id: '@metric-org/metric-ai-for-tests',
  name: 'Metric AI (Testes)',
  creator: 'Metric',
  description: 'Addon de IA para testes de OCR e análise de atividade visual.',
  path: '',
  logo: 'Sparkles',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'Watchers',
  tags: ['ai', 'ocr', 'teste'],
}

const DEV_DISCORD_MANIFEST: AddonManifest = {
  id: '@metric-org/discord-for-tests',
  name: 'Discord Presence',
  creator: 'Metric',
  description: 'Sincroniza status do timer no Discord',
  path: '',
  logo: 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'Watchers',
  tags: ['discord', 'watcher', 'teste'],
}

const DEV_FAKE_WATCHER_MANIFEST: AddonManifest = {
  id: '@metric-org/fake-watcher-for-tests',
  name: 'Fake Watcher',
  creator: 'Metric',
  description: 'Watcher falso para testes',
  path: '',
  logo: '',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'Watchers',
  tags: ['watcher', 'teste'],
}

const DEV_SUPABASE_THEME_MANIFEST: AddonManifest = {
  id: '@metric-org/supabase-theme',
  name: 'Supabase Emerald',
  creator: 'Metric',
  description: 'Tema verde esmeralda inspirado no Supabase.',
  path: '',
  logo: 'Palette',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'Themes',
  tags: ['theme', 'tema', 'supabase', 'dark'],
}

const DEV_PURPLE_THEME_MANIFEST: AddonManifest = {
  id: '@metric-org/purple-theme',
  name: 'Purple Neon',
  creator: 'Metric',
  description: 'Tema roxo vibrante neon.',
  path: '',
  logo: 'Palette',
  downloads: 0,
  version: '1.0.0',
  stars: 0,
  installed: true,
  category: 'Themes',
  tags: ['theme', 'tema', 'purple', 'neon'],
}

const DEV_ADDONS: AddonManifest[] = [
  DEV_FAKE_MANIFEST,
  DEV_REDMINE_MANIFEST,
  DEV_METRIC_AI_MANIFEST,
  DEV_DISCORD_MANIFEST,
  DEV_FAKE_WATCHER_MANIFEST,
  DEV_SUPABASE_THEME_MANIFEST,
  DEV_PURPLE_THEME_MANIFEST,
]

import { SidebarMenuItem, TimerbarMenuItem } from '@metric-org/sdk'

import { AddonLoader } from '@/main/services/AddonLoader'

function isDevelopment(): boolean {
  return !app.isPackaged
}

export class AddonsHandler implements HandlerBase<AddonsHandler> {
  constructor(
    private readonly importAddonService: IImportAddonUseCase,
    private readonly addonsFacade: IAddonsFacade,
    private readonly jobEmitter: IEventEmitter<IJobEvents>,
    private readonly addonLoader?: AddonLoader,
  ) {}

  public async getSidebarMenus(): Promise<ViewModel<SidebarMenuItem[]>> {
    const items = this.addonLoader ? this.addonLoader.getSidebarMenus() : []
    return {
      isSuccess: true,
      statusCode: 200,
      data: items,
    }
  }

  public async getTimerbarMenus(): Promise<ViewModel<TimerbarMenuItem[]>> {
    const items = this.addonLoader ? this.addonLoader.getTimerbarMenus() : []
    return {
      isSuccess: true,
      statusCode: 200,
      data: items,
    }
  }

  public async executeCommand(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ commandId: string; args?: any[] }>,
  ): Promise<ViewModel<any>> {
    if (!body?.commandId) {
      return {
        isSuccess: false,
        statusCode: 400,
        error: 'COMMAND_ID_REQUIRED',
      }
    }
    try {
      const result = await this.addonLoader?.executeCommand(
        body.commandId,
        ...(body.args ?? []),
      )
      return {
        isSuccess: true,
        statusCode: 200,
        data: result,
      }
    } catch (err: any) {
      return {
        isSuccess: false,
        statusCode: 500,
        error: err?.message ?? 'COMMAND_EXECUTION_FAILED',
      }
    }
  }

  public async showToast(
    _event: IpcMainInvokeEvent,
    {
      body,
    }: IRequest<{
      type?: 'info' | 'success' | 'warning' | 'error' | 'loading'
      message: string
      title?: string
      toastId?: string
    }>,
  ): Promise<ViewModel<string>> {
    const id = this.addonLoader?.showToast(
      body.type ?? 'info',
      body.message,
      body.title,
      body.toastId,
    )
    return {
      isSuccess: true,
      statusCode: 200,
      data: id ?? '',
    }
  }

  public async dismissToast(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ toastId: string }>,
  ): Promise<ViewModel<void>> {
    this.addonLoader?.dismissToast(body.toastId)
    return {
      isSuccess: true,
      statusCode: 200,
    }
  }

  public async getSchema(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string }>,
  ): Promise<ViewModel<AddonSettingsSchema>> {
    if (!this.addonLoader) return { isSuccess: true, data: [] }
    try {
      const schema = await this.addonLoader.getSettingsSchema(body.addonId)
      return { isSuccess: true, data: schema }
    } catch (e: unknown) {
      return { isSuccess: false, error: (e as Error).message }
    }
  }

  public async getSettings(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string }>,
  ): Promise<ViewModel<Record<string, unknown>>> {
    if (!this.addonLoader) return { isSuccess: true, data: {} }
    try {
      const data = await this.addonLoader.getAddonSettings(body.addonId)
      return { isSuccess: true, data }
    } catch (e: unknown) {
      return { isSuccess: false, error: (e as Error).message }
    }
  }

  public async saveSettings(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string; settings: Record<string, unknown> }>,
  ): Promise<ViewModel<void>> {
    if (!this.addonLoader)
      return { isSuccess: false, error: 'LOADER_NOT_FOUND' }
    try {
      await this.addonLoader.saveAddonSettings(body.addonId, body.settings)
      return { isSuccess: true }
    } catch (e: unknown) {
      return { isSuccess: false, error: (e as Error).message }
    }
  }

  public async executeAction(
    _event: IpcMainInvokeEvent,
    {
      body,
    }: IRequest<{ addonId: string; actionId: string; payload?: unknown }>,
  ): Promise<ViewModel<unknown>> {
    if (!this.addonLoader)
      return { isSuccess: false, error: 'LOADER_NOT_FOUND' }
    try {
      const data = await this.addonLoader.executeAction(
        body.addonId,
        body.actionId,
        body.payload,
      )
      return { isSuccess: true, data }
    } catch (e: unknown) {
      return { isSuccess: false, error: (e as Error).message }
    }
  }

  public async setActiveWorkspace(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ workspaceId: string }>,
  ): Promise<ViewModel<void>> {
    if (this.addonLoader && body?.workspaceId) {
      this.addonLoader.setActiveWorkspace(body.workspaceId)
    }
    return { isSuccess: true }
  }

  public async getActiveTheme(): Promise<
    ViewModel<AddonThemeViewModel | null>
  > {
    const theme = this.addonLoader ? this.addonLoader.getActiveTheme() : null
    return {
      isSuccess: true,
      statusCode: 200,
      data: theme,
    }
  }

  public async setActiveTheme(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ themeId: string | null }>,
  ): Promise<ViewModel<void>> {
    if (this.addonLoader) {
      this.addonLoader.setActiveTheme(body?.themeId ?? null)
    }
    return { isSuccess: true, statusCode: 200 }
  }

  public async listAvailable(
    _event?: IpcMainInvokeEvent,
    _req?: IRequest,
  ): Promise<PaginatedViewModel<AddonManifestViewModel[]>> {
    const result = await this.addonsFacade.listAvailable()

    const mappedResult = result.map((items) => {
      const viewModels = items.map((item) => ({
        ...item,
      }))

      return {
        data: viewModels,
        totalItems: items.length,
        totalPages: 1,
        currentPage: 1,
      }
    })

    return createResponseViewModel(mappedResult)
  }

  public async listInstalled(
    _event?: IpcMainInvokeEvent,
    _req?: IRequest,
  ): Promise<PaginatedViewModel<AddonManifestViewModel[]>> {
    const result = await this.addonsFacade.listInstalled()

    if (result.isFailure()) {
      return createResponseViewModel(result.forwardFailure())
    }

    let installedItems = result.success

    // Em modo de desenvolvimento, mescla os DEV_ADDONS caso ainda não existam no disco
    if (isDevelopment()) {
      const existingIds = new Set(installedItems.map((item) => item.id))
      const extraDevAddons = DEV_ADDONS.filter(
        (dev) => !existingIds.has(dev.id),
      )
      installedItems = [...installedItems, ...extraDevAddons]
    }

    const viewModels = installedItems.map((item) => ({
      ...item,
      installed: true,
    }))

    return {
      isSuccess: true,
      statusCode: 200,
      data: viewModels,
      totalItems: viewModels.length,
      totalPages: 1,
      currentPage: 1,
    }
  }

  public async uninstall(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string; version?: string }>,
  ): Promise<ViewModel<void>> {
    if (!body?.addonId) {
      return {
        isSuccess: false,
        statusCode: 400,
        error: 'ADDON_ID_REQUIRED',
      }
    }

    const result = await this.addonsFacade.uninstallAddon(
      body.addonId,
      body.version,
    )
    return createResponseViewModel(result)
  }

  public async getInstalledById(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addonId: string }>,
  ): Promise<ViewModel<AddonManifestViewModel>> {
    if (isDevelopment()) {
      const dev = DEV_ADDONS.find((a) => a.id === body.addonId)
      if (dev) {
        return { isSuccess: true, statusCode: 200, data: dev }
      }
    }
    const result = await this.addonsFacade.getInstalledById(body.addonId)

    return createResponseViewModel(result)
  }

  public async getInstaller(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ installerUrl: string }>,
  ): Promise<ViewModel<AddonInstallerViewModel>> {
    const result = await this.addonsFacade.getInstaller(body.installerUrl)

    return createResponseViewModel(result)
  }

  public async updateLocal(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<AddonManifest>,
  ): Promise<ViewModel<void>> {
    if (!body?.id) {
      return {
        isSuccess: false,
        statusCode: 400,
        error: 'INVALID_ADDON_MANIFEST',
      }
    }

    return {
      isSuccess: true,
      statusCode: 200,
    }
  }

  public async import(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ addon: FileData }>,
  ): Promise<ViewModel> {
    const result = await this.importAddonService.execute(body.addon)

    return createResponseViewModel(result)
  }

  public async install(
    _event: IpcMainInvokeEvent,
    { body }: IRequest<{ downloadUrl: string }>,
  ): Promise<ViewModel<IJobResult>> {
    const jobId = crypto.randomUUID()

    this.runInstallationJob(jobId, body.downloadUrl).catch((err) => {
      console.error(`[Fatal Job Error ${jobId}]:`, err)
    })

    return {
      isSuccess: true,
      statusCode: 200,
      data: { jobId },
    }
  }

  private async runInstallationJob(
    jobId: string,
    downloadUrl: string,
  ): Promise<void> {
    try {
      this.jobEmitter.emit(jobId, { status: 'progress', value: 0 })

      const downloadResult = await this.addonsFacade.downloadFile(
        downloadUrl,
        (event) => {
          if (event.status !== 'progress') {
            this.jobEmitter.emit(jobId, event)
            return
          }
          const scaledValue = Math.floor(event.value * 0.7)

          this.jobEmitter.emit(jobId, {
            status: 'progress',
            value: scaledValue,
          })
        },
      )

      if (downloadResult.isFailure()) {
        this.jobEmitter.emit(jobId, {
          status: 'error',
          error: downloadResult.failure.messageKey,
        })
        return
      }

      this.jobEmitter.emit(jobId, { status: 'progress', value: 70 })

      const result = await this.importAddonService.execute(
        downloadResult.success,
        (event) => {
          if (event.status !== 'progress') {
            this.jobEmitter.emit(jobId, event)
            return
          }

          const scaledValue = 70 + Math.floor(event.value * 0.3)
          this.jobEmitter.emit(jobId, {
            status: 'progress',
            value: scaledValue,
          })
        },
      )

      if (result.isFailure()) {
        this.jobEmitter.emit(jobId, {
          status: 'error',
          error: result.failure.messageKey,
        })
        return
      }

      this.jobEmitter.emit(jobId, { status: 'progress', value: 100 })
      this.jobEmitter.emit(jobId, { status: 'done' })
    } catch (err) {
      this.jobEmitter.emit(jobId, {
        status: 'error',
        error: 'INSTALL_FAILED',
      })
    }
  }
}

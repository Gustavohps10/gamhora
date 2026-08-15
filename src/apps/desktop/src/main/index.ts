import { createRequire } from 'node:module'

import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
  JSONWorkspacesQuery,
  JSONWorkspacesRepository,
} from '@metric-org/adapters/data'
import { KeytarTokenStorage } from '@metric-org/adapters/tools'
import { HardDiskStorage } from '@metric-org/adapters/tools'
import { ContainerBuilder, PlatformDependencies } from '@metric-org/IoC'
import {
  app,
  BrowserWindow,
  net,
  protocol,
  screen,
  shell,
  Tray,
} from 'electron'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { ElectronJobEventEmitter } from '@/main/adapters/ElectronJobEventEmitter'
import { TimerRuntime } from '@/main/adapters/TimerRuntime'
import {
  ConnectionHandler,
  SessionHandler,
  TasksHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/main/handlers'
import { AddonsHandler } from '@/main/handlers/AddonsHandler'
import { MetadataHandler } from '@/main/handlers/MetadataHandler'
import { WorkspacesHandler } from '@/main/handlers/WorkspacesHandler'
import { DataSourceResolver } from '@/main/resolvers/data-source-resolver'
import { openIpcRoutes } from '@/main/routes'
import { getSettings } from '@/main/settings'
import { createTray } from '@/main/tray'

const requireNative = createRequire(import.meta.url)

interface NativeOverlay {
  applyOverlayStyles: (handle: Buffer) => boolean
}

let nativeOverlay: NativeOverlay | null = null

if (process.platform === 'win32') {
  try {
    const binaryPath = app.isPackaged
      ? join(process.resourcesPath, 'native-prebuilds/window_overlay.node')
      : join(__dirname, '../../native-prebuilds/window_overlay.node')

    nativeOverlay = requireNative(binaryPath)

    console.log('[@metric-org/desktop] ✓ Carregado: window_overlay.node:')
  } catch (err) {
    console.error(
      '[@metric-org/desktop] Erro ao carregar window_overlay.node:',
      err,
    )
  }
}

// Flags do Chromium para evitar estrangulamento de background
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let secondaryWindow: BrowserWindow | null = null

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'metric-app',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
])

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })
  ;(mainWindow as unknown as { windowType: string }).windowType = 'main'
  mainWindow.on('ready-to-show', () => {
    const settings = getSettings()
    settings.startMinimized ? mainWindow?.minimize() : mainWindow?.show()
  })

  // --- INÍCIO DA CORREÇÃO DE ARRASTE ---
  let moveTimeout: NodeJS.Timeout | null = null

  mainWindow.on('will-move', () => {
    if (secondaryWindow && !secondaryWindow.isDestroyed()) {
      // Desativa o hit-testing pesado do widget enquanto a principal se move
      secondaryWindow.setIgnoreMouseEvents(true, { forward: false })

      if (moveTimeout) clearTimeout(moveTimeout)

      // Restaura o forward 150ms após a janela principal parar de se mover
      moveTimeout = setTimeout(() => {
        if (secondaryWindow && !secondaryWindow.isDestroyed()) {
          secondaryWindow.setIgnoreMouseEvents(true, { forward: true })
        }
      }, 150)
    }
  })
  // --- FIM DA CORREÇÃO DE ARRASTE ---

  mainWindow.on('moved', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds()
      mainWindow.webContents.send('window:bounds-changed', bounds)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((d) => {
    shell.openExternal(d.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const createSecondaryWindow = (
  activeWorkspaceId?: string,
  targetDisplayId?: number,
) => {
  // Pega todos os monitores disponíveis
  const allDisplays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()

  // Encontra o monitor de destino ou usa o primário como fallback
  const targetDisplay =
    allDisplays.find((d) => d.id === targetDisplayId) || primaryDisplay
  const { x, y, width, height } = targetDisplay.workArea

  secondaryWindow = new BrowserWindow({
    width,
    height,
    x, // Aplica o offset global real do monitor (ex: 1920 se for o Monitor 2 à direita)
    y,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false, // Evita redimensionamento acidental
    hasShadow: false,
    focusable: true, // Remove a janela da fila de foco do SO
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      backgroundThrottling: false,
      sandbox: false,
    },
  })
  ;(secondaryWindow as unknown as { windowType: string }).windowType = 'widget'

  // Aplica os estilos Win32 estendidos e o hook WM_MOUSEACTIVATE via C++
  if (process.platform === 'win32' && nativeOverlay) {
    const handle = secondaryWindow.getNativeWindowHandle()
    nativeOverlay.applyOverlayStyles(handle)
  }

  secondaryWindow.on('moved', () => {
    if (secondaryWindow && !secondaryWindow.isDestroyed()) {
      const bounds = secondaryWindow.getBounds()
      secondaryWindow.webContents.send('window:bounds-changed', bounds)

      // Força a re-aplicação em qualquer movimento para evitar reset do SO
      secondaryWindow.setIgnoreMouseEvents(true, { forward: true })
    }
  })

  secondaryWindow.setIgnoreMouseEvents(true, { forward: true })

  secondaryWindow.once('ready-to-show', () => {
    secondaryWindow!.show()
  })

  secondaryWindow.on('closed', () => {
    secondaryWindow = null
  })

  const workspaceId = activeWorkspaceId ?? 'default'
  const widgetHashPath = `/workspaces/${workspaceId}/widgets/timer`

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    secondaryWindow.loadURL(
      `${process.env['ELECTRON_RENDERER_URL']}/#${widgetHashPath}`,
    )
  } else {
    secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: widgetHashPath,
    })
  }
}

export type IHandlersScope = {
  connectionHandler: typeof ConnectionHandler
  sessionHandler: typeof SessionHandler
  tasksHandler: typeof TasksHandler
  timeEntriesHandler: typeof TimeEntriesHandler
  tokenHandler: typeof TokenHandler
  workspacesHandler: typeof WorkspacesHandler
  addonsHandler: typeof AddonsHandler
  metadataHandler: typeof MetadataHandler
}

function handleProtocol() {
  protocol.handle('metric-app', async (request) => {
    try {
      let filePath = request.url.replace('metric-app://', '')

      filePath = filePath.replace(/[?&]buster=[^&]*/g, '').replace(/[?&]$/, '')

      filePath = decodeURIComponent(filePath)

      if (process.platform === 'win32' && /^[a-zA-Z]\//.test(filePath)) {
        filePath = filePath[0].toUpperCase() + ':' + filePath.slice(1)
      }

      const fileUrl = pathToFileURL(filePath).toString()

      return net.fetch(fileUrl)
    } catch (error) {
      console.error('Erro no protocolo metric-app:', error)
      return new Response('Resource not found', { status: 404 })
    }
  })
}

app.whenReady().then(async () => {
  const timerRuntime = new TimerRuntime()
  timerRuntime.init()

  handleProtocol()
  const userDataPath = app.getPath('userData')
  const credentialsStorage = new KeytarTokenStorage()
  const workspacesRepository = new JSONWorkspacesRepository(userDataPath)
  const workspacesQuery = new JSONWorkspacesQuery(userDataPath)
  const eventEmitter = new ElectronJobEventEmitter(() => mainWindow)
  const nodeFileStorage = new HardDiskStorage(userDataPath, 'metric-app://')
  const localDataSourceResolver = new DataSourceResolver(
    workspacesRepository,
    credentialsStorage,
    {
      addonsBasePath: join(__dirname, '../addons/datasource'),
      isDevelopment: !app.isPackaged,
    },
  )

  const platformDeps: PlatformDependencies = {
    jobEmitter: eventEmitter,
    credentialsStorage,
    workspacesRepository,
    workspacesQuery,
    fileStorage: nodeFileStorage,
    dataSourceResolver: localDataSourceResolver,
  }

  const serviceProvider = new ContainerBuilder()
    .addPlatformDependencies(platformDeps)
    .addInfrastructure()
    .addApplicationServices()
    .addScoped<IHandlersScope>({
      connectionHandler: ConnectionHandler,
      sessionHandler: SessionHandler,
      tasksHandler: TasksHandler,
      timeEntriesHandler: TimeEntriesHandler,
      tokenHandler: TokenHandler,
      workspacesHandler: WorkspacesHandler,
      addonsHandler: AddonsHandler,
      metadataHandler: MetadataHandler,
    })
    .build()

  openIpcRoutes(serviceProvider)

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, browserWindow) => {
    optimizer.watchWindowShortcuts(browserWindow)

    browserWindow.webContents.on('before-input-event', (_, input) => {
      const f12 = input.key === 'F12'

      const ctrlShiftI =
        input.control && input.shift && input.key.toLowerCase() === 'i'

      const ctrlShiftR =
        input.control && input.shift && input.key.toLowerCase() === 'r'

      const ctrlR =
        input.control && !input.shift && input.key.toLowerCase() === 'r'

      const f5 = input.key === 'F5'

      if (input.type === 'keyDown') {
        if (f12 || ctrlShiftI) {
          browserWindow.webContents.toggleDevTools()
        }
        if (ctrlShiftR || ctrlR || f5) {
          browserWindow.webContents.reloadIgnoringCache()
        }
      }
    })
  })

  if (is.dev) {
    try {
      await installExtension(REACT_DEVELOPER_TOOLS, {
        loadExtensionOptions: { allowFileAccess: true },
        // forceDownload: true,
      })
      console.log(`✅ Extensão REACT DEV TOOLS instalada com sucesso`)
    } catch (err) {
      console.error('❌ Erro ao instalar a extensão React DevTools:', err)
    }
  }

  tray = createTray(
    () => secondaryWindow,
    () => createSecondaryWindow(),
  )
  createWindow()
  createSecondaryWindow() // Cria a janela flutuante para o workspace padrão

  //ANALISAR FUTURAMENTE o uso no main process
  // exposeIpcMainRxStorage({
  //   key: 'main-storage',
  //   storage: getRxStorageDexie({
  //     indexedDB, // SALVA TUDO IN MEMORY com INDEXED FAKE
  //     IDBKeyRange,
  //   }),
  //   ipcMain: ipcMain,
  // })
  // createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

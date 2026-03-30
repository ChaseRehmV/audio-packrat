import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startDownload, cancelDownload } from './download-service'
import { getHistory, clearHistory } from './history-service'
import { searchYoutube } from './search-service'
import type { DownloadRequest } from '../shared/types'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('start-download', async (_event, request: DownloadRequest) => {
    if (!mainWindow) throw new Error('No window available')
    const downloadId = startDownload(request, mainWindow)
    return { downloadId }
  })

  ipcMain.handle('cancel-download', async () => {
    cancelDownload()
  })

  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('get-history', async () => {
    return getHistory()
  })

  ipcMain.handle('clear-history', async () => {
    clearHistory()
  })

  ipcMain.handle('get-default-download-dir', async () => {
    return app.getPath('downloads')
  })

  ipcMain.handle('search-youtube', async (_event, query: string, offset: number) => {
    return searchYoutube(query, offset)
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.audiopackrat')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

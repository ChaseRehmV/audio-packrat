import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AppAPI, DownloadRequest, DownloadOutputLine, DownloadComplete } from '../shared/types'

const api: AppAPI = {
  searchYoutube: (query: string, offset: number) =>
    ipcRenderer.invoke('search-youtube', query, offset),

  startDownload: (request: DownloadRequest) => ipcRenderer.invoke('start-download', request),

  cancelDownload: (downloadId: string) => ipcRenderer.invoke('cancel-download', downloadId),

  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  getHistory: () => ipcRenderer.invoke('get-history'),

  clearHistory: () => ipcRenderer.invoke('clear-history'),

  getDefaultDownloadDir: () => ipcRenderer.invoke('get-default-download-dir'),

  onDownloadOutput: (callback: (data: DownloadOutputLine) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: DownloadOutputLine): void => {
      callback(data)
    }
    ipcRenderer.on('download-output', listener)
    return () => {
      ipcRenderer.removeListener('download-output', listener)
    }
  },

  onDownloadComplete: (callback: (data: DownloadComplete) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: DownloadComplete): void => {
      callback(data)
    }
    ipcRenderer.on('download-complete', listener)
    return () => {
      ipcRenderer.removeListener('download-complete', listener)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

import { spawn, ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'
import { randomUUID } from 'crypto'
import { getYtDlpPath, getFfmpegPath } from './binaries'
import { addHistoryEntry } from './history-service'
import type { DownloadRequest } from '../shared/types'

let activeProcess: ChildProcess | null = null
let activeRequest: DownloadRequest | null = null
let capturedTitle: string | null = null

function buildArgs(request: DownloadRequest): string[] {
  const args: string[] = [
    '--extract-audio',
    '--audio-format',
    request.format,
    '--audio-quality',
    '0',
    '--postprocessor-args',
    'ffmpeg:-ar 44100',
    '--ffmpeg-location',
    getFfmpegPath(),
    '--output',
    `${request.outputDir}/%(title)s.%(ext)s`,
    '--newline'
  ]

  // Allow playlists if URL looks like one, otherwise restrict to single video
  if (!request.url.includes('playlist') && !request.url.includes('list=')) {
    args.push('--no-playlist')
  }

  if (request.embedThumbnail) {
    args.push('--embed-thumbnail')
  }

  if (request.artist || request.album) {
    args.push('--embed-metadata')
    if (request.artist) {
      args.push('--parse-metadata', `${request.artist}:%(artist)s`)
    }
    if (request.album) {
      args.push('--parse-metadata', `${request.album}:%(album)s`)
    }
  }

  args.push(request.url)
  return args
}

export function startDownload(request: DownloadRequest, window: BrowserWindow): string {
  if (activeProcess) {
    throw new Error('A download is already in progress')
  }

  const downloadId = randomUUID()
  activeRequest = request
  capturedTitle = null

  const ytDlpPath = getYtDlpPath()
  const args = buildArgs(request)

  const proc = spawn(ytDlpPath, args, {
    env: { ...process.env }
  })

  activeProcess = proc

  proc.stdout.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(Boolean)
    for (const line of lines) {
      // Try to capture the title from yt-dlp output
      const destinationMatch = line.match(/\[download\] Destination: .*\/(.+)\.\w+$/)
      if (destinationMatch) {
        capturedTitle = destinationMatch[1]
      }

      window.webContents.send('download-output', {
        downloadId,
        line,
        stream: 'stdout'
      })
    }
  })

  proc.stderr.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(Boolean)
    for (const line of lines) {
      window.webContents.send('download-output', {
        downloadId,
        line,
        stream: 'stderr'
      })
    }
  })

  proc.on('close', (code) => {
    if (activeRequest) {
      addHistoryEntry({
        id: downloadId,
        url: activeRequest.url,
        title: capturedTitle || activeRequest.url,
        format: activeRequest.format,
        artist: activeRequest.artist,
        album: activeRequest.album,
        outputDir: activeRequest.outputDir,
        date: new Date().toISOString(),
        status: code === 0 ? 'completed' : 'failed'
      })
    }

    activeProcess = null
    activeRequest = null
    capturedTitle = null

    window.webContents.send('download-complete', {
      downloadId,
      success: code === 0,
      error: code !== 0 ? `yt-dlp exited with code ${code}` : undefined
    })
  })

  proc.on('error', (err) => {
    if (activeRequest) {
      addHistoryEntry({
        id: downloadId,
        url: activeRequest.url,
        title: capturedTitle || activeRequest.url,
        format: activeRequest.format,
        artist: activeRequest.artist,
        album: activeRequest.album,
        outputDir: activeRequest.outputDir,
        date: new Date().toISOString(),
        status: 'failed'
      })
    }

    activeProcess = null
    activeRequest = null
    capturedTitle = null

    window.webContents.send('download-complete', {
      downloadId,
      success: false,
      error: err.message
    })
  })

  return downloadId
}

export function cancelDownload(): void {
  if (activeProcess) {
    activeProcess.kill('SIGTERM')
    activeProcess = null
    activeRequest = null
    capturedTitle = null
  }
}

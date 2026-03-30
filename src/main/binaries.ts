import { app } from 'electron'
import { join } from 'path'

function getPlatformDir(): string {
  switch (process.platform) {
    case 'darwin':
      return 'mac'
    case 'win32':
      return 'win'
    case 'linux':
      return 'linux'
    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

function getBinariesPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'bin', getPlatformDir())
  }
  return join(app.getAppPath(), 'resources', 'bin', getPlatformDir())
}

export function getYtDlpPath(): string {
  const binDir = getBinariesPath()
  const exe = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
  return join(binDir, exe)
}

export function getFfmpegPath(): string {
  const binDir = getBinariesPath()
  const exe = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  return join(binDir, exe)
}

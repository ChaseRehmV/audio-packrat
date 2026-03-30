import { spawn } from 'child_process'
import { getYtDlpPath } from './binaries'
import type { SearchResult } from '../shared/types'

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function searchYoutube(query: string, offset: number): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const count = offset + 20
    const ytDlpPath = getYtDlpPath()
    const args = [
      `ytsearch${count}:${query}`,
      '--dump-json',
      '--flat-playlist',
      '--no-download',
      '--no-warnings'
    ]

    const proc = spawn(ytDlpPath, args, {
      env: { ...process.env }
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp search failed: ${stderr}`))
        return
      }

      try {
        const lines = stdout.trim().split('\n').filter(Boolean)
        // Skip results we already have (offset)
        const newLines = lines.slice(offset)
        const results: SearchResult[] = newLines.map((line) => {
          const json = JSON.parse(line)
          return {
            id: json.id,
            title: json.title || json.fulltitle || 'Untitled',
            url: json.url || json.webpage_url || `https://www.youtube.com/watch?v=${json.id}`,
            thumbnail:
              json.thumbnail ||
              json.thumbnails?.[json.thumbnails.length - 1]?.url ||
              '',
            duration: formatDuration(json.duration)
          }
        })
        resolve(results)
      } catch (err) {
        reject(new Error(`Failed to parse search results: ${err}`))
      }
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
}

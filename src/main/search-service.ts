import { spawn } from 'child_process'
import { getYtDlpPath } from './binaries'
import type { SearchResult } from '../shared/types'

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function sanitizeQuery(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f]/g, '')
    .slice(0, 500)
}

export function searchYoutube(query: string, offset: number): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const safeQuery = sanitizeQuery(query)
    if (!safeQuery) {
      resolve([])
      return
    }
    const safeOffset = Math.max(0, Math.floor(offset))
    const count = safeOffset + 20
    const ytDlpPath = getYtDlpPath()
    const args = [
      `ytsearch${count}:${safeQuery}`,
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
        const newLines = lines.slice(safeOffset)
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

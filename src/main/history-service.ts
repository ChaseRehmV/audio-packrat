import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import type { HistoryEntry } from '../shared/types'

const HISTORY_FILE = join(app.getPath('userData'), 'download-history.json')

function loadHistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_FILE)) return []
  try {
    const data = readFileSync(HISTORY_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf-8')
}

export function addHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory()
  history.unshift(entry)
  saveHistory(history)
}

export function getHistory(): HistoryEntry[] {
  return loadHistory()
}

export function clearHistory(): void {
  saveHistory([])
}

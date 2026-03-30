export type AudioFormat = 'mp3' | 'flac' | 'wav' | 'm4a'

export interface DownloadRequest {
  url: string
  format: AudioFormat
  outputDir: string
  artist?: string
  album?: string
  embedThumbnail: boolean
}

export interface DownloadOutputLine {
  downloadId: string
  line: string
  stream: 'stdout' | 'stderr'
}

export interface DownloadComplete {
  downloadId: string
  success: boolean
  error?: string
}

export interface DownloadStarted {
  downloadId: string
}

export interface HistoryEntry {
  id: string
  url: string
  title: string
  format: AudioFormat
  artist?: string
  album?: string
  outputDir: string
  date: string
  status: 'completed' | 'failed' | 'cancelled'
}

export interface SearchResult {
  id: string
  title: string
  url: string
  thumbnail: string
  duration: string
}

export interface AppAPI {
  searchYoutube: (query: string, offset: number) => Promise<SearchResult[]>
  startDownload: (request: DownloadRequest) => Promise<DownloadStarted>
  cancelDownload: (downloadId: string) => Promise<void>
  selectDirectory: () => Promise<string | null>
  getHistory: () => Promise<HistoryEntry[]>
  clearHistory: () => Promise<void>
  getDefaultDownloadDir: () => Promise<string>
  onDownloadOutput: (callback: (data: DownloadOutputLine) => void) => () => void
  onDownloadComplete: (callback: (data: DownloadComplete) => void) => () => void
}

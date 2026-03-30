import { useState, useEffect, useCallback } from 'react'
import type { DownloadRequest, DownloadOutputLine, HistoryEntry } from '../../shared/types'
import Sidebar from './components/Sidebar'
import SearchPanel from './components/SearchPanel'
import DownloadForm from './components/DownloadForm'
import OutputConsole from './components/OutputConsole'
import DownloadHistory from './components/DownloadHistory'

type Screen = 'download' | 'history'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('download')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadId, setDownloadId] = useState<string | null>(null)
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [outputDir, setOutputDir] = useState<string>('')
  const [selectedUrl, setSelectedUrl] = useState<string>('')

  useEffect(() => {
    window.api.getDefaultDownloadDir().then(setOutputDir)
    window.api.getHistory().then(setHistory)
  }, [])

  useEffect(() => {
    const cleanupOutput = window.api.onDownloadOutput((data: DownloadOutputLine) => {
      setOutputLines((prev) => [...prev, data.line])
    })
    const cleanupComplete = window.api.onDownloadComplete(() => {
      setIsDownloading(false)
      setDownloadId(null)
      window.api.getHistory().then(setHistory)
    })
    return () => {
      cleanupOutput()
      cleanupComplete()
    }
  }, [])

  const handleStartDownload = useCallback(async (request: DownloadRequest) => {
    setOutputLines([])
    setIsDownloading(true)
    const result = await window.api.startDownload(request)
    setDownloadId(result.downloadId)
  }, [])

  const handleCancel = useCallback(async () => {
    if (downloadId) {
      await window.api.cancelDownload(downloadId)
    }
  }, [downloadId])

  const handleSelectDirectory = useCallback(async () => {
    const dir = await window.api.selectDirectory()
    if (dir) setOutputDir(dir)
  }, [])

  const handleClearHistory = useCallback(async () => {
    await window.api.clearHistory()
    setHistory([])
  }, [])

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      <Sidebar activeScreen={screen} onNavigate={setScreen} />

      <main className="flex-1 overflow-hidden">
        {screen === 'download' && (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-gray-800 p-6 flex flex-col">
              <SearchPanel onSelectUrl={setSelectedUrl} />
            </div>

            <div className="w-1/2 p-6 overflow-y-auto flex flex-col gap-6">
              <header className="text-center">
                <h1 className="text-2xl font-bold text-white">Audio Packrat</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Download and archive audio from the web
                </p>
              </header>
              <DownloadForm
                isDownloading={isDownloading}
                outputDir={outputDir}
                selectedUrl={selectedUrl}
                onStart={handleStartDownload}
                onCancel={handleCancel}
                onSelectDirectory={handleSelectDirectory}
              />
              <OutputConsole lines={outputLines} />
            </div>
          </div>
        )}

        {screen === 'history' && (
          <div className="max-w-2xl mx-auto p-6">
            <DownloadHistory entries={history} onClear={handleClearHistory} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

import type { HistoryEntry } from '../../../shared/types'

interface DownloadHistoryProps {
  entries: HistoryEntry[]
  onClear: () => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function DownloadHistory({ entries, onClear }: DownloadHistoryProps): React.JSX.Element {
  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">History</h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          No downloads yet
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1">
          {entries.map((entry) => (
            <div key={entry.id} className="border-b border-gray-800 py-3 last:border-0">
              <div className="flex items-start gap-2">
                <span className={entry.status === 'completed' ? 'text-green-400' : 'text-red-400'}>
                  {entry.status === 'completed' ? '\u2713' : '\u2717'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full uppercase">
                      {entry.format}
                    </span>
                    {entry.artist && (
                      <span className="text-xs text-gray-500 truncate">{entry.artist}</span>
                    )}
                    {entry.album && (
                      <span className="text-xs text-gray-500 truncate">- {entry.album}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(entry.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DownloadHistory

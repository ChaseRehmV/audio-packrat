import { useState, useRef, useCallback } from 'react'
import type { SearchResult } from '../../../shared/types'

interface SearchPanelProps {
  onSelectUrl: (url: string) => void
}

function SearchPanel({ onSelectUrl }: SearchPanelProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setResults([])
    setSearchedQuery(query.trim())
    setHasMore(false)

    try {
      const newResults = await window.api.searchYoutube(query.trim(), 0)
      setResults(newResults)
      setHasMore(newResults.length >= 20)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !searchedQuery) return

    setLoading(true)
    try {
      const newResults = await window.api.searchYoutube(searchedQuery, results.length)
      if (newResults.length === 0) {
        setHasMore(false)
      } else {
        setResults((prev) => [...prev, ...newResults])
        setHasMore(newResults.length >= 20)
      }
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, searchedQuery, results.length])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      loadMore()
    }
  }, [loadMore])

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 min-h-0"
      >
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-gray-900 rounded-lg p-3 flex items-center gap-3"
          >
            <img
              src={result.thumbnail}
              alt=""
              className="w-24 h-16 object-cover rounded shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 line-clamp-2">{result.title}</p>
              <p className="text-xs text-gray-500 mt-1">{result.duration}</p>
            </div>
            <button
              onClick={() => onSelectUrl(result.url)}
              className="shrink-0 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Add to Download
            </button>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length === 0 && searchedQuery && (
          <div className="text-center text-gray-600 text-sm py-8">No results found</div>
        )}

        {!loading && results.length === 0 && !searchedQuery && (
          <div className="text-center text-gray-600 text-sm py-8">
            Search for YouTube videos above
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPanel

import { useState, useEffect } from 'react'
import type { AudioFormat, DownloadRequest } from '../../../shared/types'

interface DownloadFormProps {
  isDownloading: boolean
  outputDir: string
  selectedUrl?: string
  onStart: (request: DownloadRequest) => void
  onCancel: () => void
  onSelectDirectory: () => void
}

function DownloadForm({
  isDownloading,
  outputDir,
  selectedUrl,
  onStart,
  onCancel,
  onSelectDirectory
}: DownloadFormProps): React.JSX.Element {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (selectedUrl) {
      setUrl(selectedUrl)
    }
  }, [selectedUrl])
  const [format, setFormat] = useState<AudioFormat>('mp3')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [embedThumbnail, setEmbedThumbnail] = useState(true)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!url.trim() || !outputDir) return

    onStart({
      url: url.trim(),
      format,
      outputDir,
      artist: artist.trim() || undefined,
      album: album.trim() || undefined,
      embedThumbnail
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Download</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="url" className="text-sm font-medium text-gray-300">
          URL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or playlist URL"
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          disabled={isDownloading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="artist" className="text-sm font-medium text-gray-300">
            Artist <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Override artist tag"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            disabled={isDownloading}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="album" className="text-sm font-medium text-gray-300">
            Album <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="album"
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Override album tag"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            disabled={isDownloading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="format" className="text-sm font-medium text-gray-300">
            Format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as AudioFormat)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:border-blue-500 focus:outline-none"
            disabled={isDownloading}
          >
            <option value="mp3">MP3</option>
            <option value="flac">FLAC</option>
            <option value="wav">WAV</option>
            <option value="m4a">M4A / AAC</option>
          </select>
        </div>

        <div className="flex items-end gap-3 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={embedThumbnail}
              onChange={(e) => setEmbedThumbnail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              disabled={isDownloading}
            />
            <span className="text-sm font-medium text-gray-300">Embed thumbnail</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Output directory</label>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 text-sm truncate">
            {outputDir || 'No directory selected'}
          </div>
          <button
            type="button"
            onClick={onSelectDirectory}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium px-4 py-2 rounded-lg transition-colors"
            disabled={isDownloading}
          >
            Browse
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {isDownloading ? (
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            disabled={!url.trim() || !outputDir}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Download
          </button>
        )}
      </div>
    </form>
  )
}

export default DownloadForm

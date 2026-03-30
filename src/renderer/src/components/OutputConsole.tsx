import { useEffect, useRef } from 'react'

interface OutputConsoleProps {
  lines: string[]
}

function OutputConsole({ lines }: OutputConsoleProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col">
      <h2 className="text-sm font-medium text-gray-400 mb-2">Output</h2>
      <div className="bg-black rounded-lg p-3 font-mono text-xs text-green-400 overflow-y-auto max-h-64 min-h-32">
        {lines.length === 0 ? (
          <span className="text-gray-600">Waiting for download...</span>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default OutputConsole

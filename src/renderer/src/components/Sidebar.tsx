type Screen = 'download' | 'history'

interface SidebarProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

function Sidebar({ activeScreen, onNavigate }: SidebarProps): React.JSX.Element {
  const items: { screen: Screen; label: string; icon: string }[] = [
    { screen: 'download', label: 'Download', icon: '\u2B07' },
    { screen: 'history', label: 'History', icon: '\u23F0' }
  ]

  return (
    <nav className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
      {items.map((item) => (
        <button
          key={item.screen}
          onClick={() => onNavigate(item.screen)}
          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
            activeScreen === item.screen
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
          }`}
          title={item.label}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px] leading-none">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Sidebar

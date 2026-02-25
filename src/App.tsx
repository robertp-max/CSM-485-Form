import CIHHLightCard from './components/design/CIHHLightCard'
import CIHHNightCard from './components/design/CIHHNightCard'
import CIHHLightWeb from './components/design/CIHHLightWeb'
import CIHHNightWeb from './components/design/CIHHNightWeb'
import { useTheme } from './hooks/useTheme'
import { useLayoutMode } from './hooks/useLayoutMode'

function App() {
  const { isDarkMode } = useTheme()
  const { isWebView } = useLayoutMode()

  if (isWebView) {
    return isDarkMode ? <CIHHNightWeb /> : <CIHHLightWeb />
  }

  return isDarkMode ? <CIHHNightCard /> : <CIHHLightCard />
}

export default App


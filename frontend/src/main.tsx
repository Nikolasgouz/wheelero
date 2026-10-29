import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource-variable/noto-sans'
import './styles.css'
import { getLanguage } from './locale'
import { currentPath, pages } from './site'
import { startAnalytics } from './lib/analytics'
import { CookieGate } from './components/CookieGate'

document.documentElement.lang = getLanguage()
const path = currentPath(location.pathname.replace(/\/$/, '') || '/')
document.title = pages[path].title
document.querySelector('meta[name="description"]')?.setAttribute('content', pages[path].description)
document.querySelector('link[rel="canonical"]')?.setAttribute('href', location.origin + path)
createRoot(document.getElementById('root')!).render(
  <CookieGate>
    <App />
  </CookieGate>,
)
startAnalytics()

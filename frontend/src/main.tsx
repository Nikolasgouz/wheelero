import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource-variable/noto-sans'
import './styles.css'
import { getLanguage, translate } from './locale'
import { currentPath, pages } from './site'

document.documentElement.lang = getLanguage()
const path = currentPath(location.pathname.replace(/\/$/, '') || '/')
document.title = translate(pages[path].title)
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', translate(pages[path].description))
document.querySelector('link[rel="canonical"]')?.setAttribute('href', location.origin + path)
createRoot(document.getElementById('root')!).render(<App />)

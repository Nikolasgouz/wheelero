import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource-variable/noto-sans'
import './styles.css'
import { getLanguage } from './locale'

document.documentElement.lang = getLanguage()
createRoot(document.getElementById('root')!).render(<App />)

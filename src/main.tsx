import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/styles/main.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('ArtVerse could not start: the #root element is missing from index.html.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

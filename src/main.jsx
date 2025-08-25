import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import './index.css'

console.log('Main.jsx loading...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, creating React app...')
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </AppErrorBoundary>
    </StrictMode>
  )
}
 
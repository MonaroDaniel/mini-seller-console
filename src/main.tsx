import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app'
import { LeadProvider } from './context/lead-context'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './context/theme-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LeadProvider>
        <App />
        <Toaster />
      </LeadProvider>
    </ThemeProvider>
  </StrictMode>,
)

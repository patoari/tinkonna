import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPushNotifications } from './lib/push'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize push notifications (best-effort)
if (import.meta.env.PROD || import.meta.env.DEV) {
  // small defer so browser finishes boot
  setTimeout(() => initPushNotifications().catch(() => {}), 1000)
}

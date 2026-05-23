import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SOSProvider } from './context/SOSContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SOSProvider>
        <App />
      </SOSProvider>
    </AuthProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CameraProvider } from './context/CameraContext.jsx'
import { StudentProvider } from './context/StudentContext.jsx'
import { ChallanProvider } from './context/ChallanContext .jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StudentProvider>
          <CameraProvider>
            <ChallanProvider>
              <App />
            </ChallanProvider>
          </CameraProvider>
        </StudentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

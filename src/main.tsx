// =====================================================================
// main.tsx : จุดเริ่มต้นของแอพ (ไฟล์แรกที่ทำงาน)
// ครอบแอพด้วย:
//   LoginProvider        = จำว่าใครล็อกอินอยู่
//   PopupMessageProvider = ข้อความเด้งด้านล่างจอ
// =====================================================================
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginProvider } from '@/shared/login/LoginProvider'
import { PopupMessageProvider } from '@/shared/parts/PopupMessage'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginProvider>
      <PopupMessageProvider>
        <App />
      </PopupMessageProvider>
    </LoginProvider>
  </StrictMode>,
)

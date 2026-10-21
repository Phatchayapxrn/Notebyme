// =====================================================================
// main.tsx : จุดเริ่มต้นของแอพ (ไฟล์แรกที่ทำงาน)
// ครอบแอพด้วย:
//   LoginProvider        = จำว่าใครล็อกอินอยู่
//   AccessProvider       = จำว่าเห็นระบบไหนได้บ้าง (ยศ / แอดมิน)
//   PopupMessageProvider = ข้อความเด้งด้านล่างจอ
// และเริ่มโหมดสี (สว่าง/มืด) ก่อนแสดงหน้าจอ
// =====================================================================
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginProvider } from '@/shared/login/LoginProvider'
import { AccessProvider } from '@/shared/access/AccessProvider'
import { PopupMessageProvider } from '@/shared/parts/PopupMessage'
import { startTheme } from '@/shared/theme/themeTools'
import { startOfflineSync } from '@/shared/offline/offlineData'
import { App } from './App'
import './index.css'

startTheme()
startOfflineSync() // ส่งข้อมูลที่เขียนตอนออฟไลน์ขึ้นฐานข้อมูล เมื่อเน็ตกลับมา

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginProvider>
      <AccessProvider>
        <PopupMessageProvider>
          <App />
        </PopupMessageProvider>
      </AccessProvider>
    </LoginProvider>
  </StrictMode>,
)

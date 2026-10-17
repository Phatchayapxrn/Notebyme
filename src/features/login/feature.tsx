// =====================================================================
// feature.tsx (login) : หน้าล็อกอิน (เข้าได้โดยไม่ต้องล็อกอิน ไม่มีในเมนู)
// =====================================================================
import { LogIn } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { LoginPage } from './LoginPage'

export const loginFeature: AppFeature = {
  id: 'login',
  menuName: 'เข้าสู่ระบบ',
  menuIcon: LogIn,
  mainPath: '/login',
  menuOrder: 0,
  showInMenu: false,
  isPublic: true,
  pages: [{ path: '/login', element: <LoginPage /> }],
}

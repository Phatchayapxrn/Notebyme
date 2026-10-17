// =====================================================================
// feature.tsx (home) : ข้อมูลของ "หน้าแรก" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { House } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { HomePage } from './HomePage'

export const homeFeature: AppFeature = {
  id: 'home',
  menuName: 'หน้าแรก',
  menuIcon: House,
  mainPath: '/',
  menuOrder: 1,
  pages: [{ path: '/', element: <HomePage /> }],
}

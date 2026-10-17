// =====================================================================
// feature.tsx (settings) : ข้อมูลของ "ตั้งค่า" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { Settings } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { SettingsPage } from './SettingsPage'

export const settingsFeature: AppFeature = {
  id: 'settings',
  menuName: 'ตั้งค่า',
  menuIcon: Settings,
  mainPath: '/settings',
  menuOrder: 99,
  pages: [{ path: '/settings', element: <SettingsPage /> }],
}

// =====================================================================
// feature.tsx (trash) : ข้อมูลของ "ถังขยะ" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { Trash2 } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { TrashPage } from './TrashPage'

export const trashFeature: AppFeature = {
  id: 'trash',
  menuName: 'ถังขยะ',
  menuIcon: Trash2,
  mainPath: '/trash',
  menuOrder: 90,
  pages: [{ path: '/trash', element: <TrashPage /> }],
}

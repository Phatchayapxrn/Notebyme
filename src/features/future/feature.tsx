// =====================================================================
// feature.tsx (future) : ข้อมูลของระบบ "ข้อความถึงตัวเองในอนาคต" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { Mail } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { FutureMessagesPage } from './pages/FutureMessagesPage'
import { FutureHomeCard } from './parts/FutureHomeCard'
import {
  bringFutureMessageBack,
  deleteFutureMessageForever,
  getAllFutureMessagesForBackup,
  getFutureMessagesInTrash,
} from './database'

export const futureFeature: AppFeature = {
  id: 'future',
  menuName: 'อนาคต',
  menuIcon: Mail,
  mainPath: '/future',
  menuOrder: 4,
  pages: [{ path: '/future', element: <FutureMessagesPage /> }],
  homeCard: FutureHomeCard,
  homeOrder: 0, // ข้อความที่ถึงวันเปิด ให้ขึ้นบนสุดของหน้าแรก
  trashActions: {
    kindName: 'ถึงอนาคต',
    kindEmoji: '💌',
    getTrashItems: getFutureMessagesInTrash,
    bringBackFromTrash: bringFutureMessageBack,
    deleteForever: deleteFutureMessageForever,
  },
  getBackupData: getAllFutureMessagesForBackup,
}
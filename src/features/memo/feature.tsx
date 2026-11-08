// =====================================================================
// feature.tsx (memo) : ข้อมูลของระบบ "โน๊ต" (แบบโน๊ตไอโฟน) สำหรับลงทะเบียนในแอพ
// เริ่มต้นล็อกไว้ให้เฉพาะยศ (ดู supabase/sql/012_memo.sql) แอดมินต้องไปติ๊กยศที่หน้าตั้งค่า
// =====================================================================
import { NotebookPen } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { bringMemoBack, deleteMemoForever, getAllMemoDataForBackup, getMemoTrashItems } from './database'
import { MemoEditPage } from './pages/MemoEditPage'
import { MemoListPage } from './pages/MemoListPage'
import { searchMemos } from './search'

export const memoFeature: AppFeature = {
  id: 'memo',
  menuName: 'โน๊ต',
  menuIcon: NotebookPen,
  mainPath: '/memo',
  menuOrder: 1.5, // อยู่ติดหน้าแรก (เลข 1) เพราะใช้บ่อย
  pages: [
    { path: '/memo', element: <MemoListPage /> },
    { path: '/memo/:memoId', element: <MemoEditPage /> },
  ],
  searchItems: searchMemos,
  trashActions: {
    kindName: 'โน๊ต',
    kindEmoji: '🗒️',
    getTrashItems: getMemoTrashItems,
    bringBackFromTrash: bringMemoBack,
    deleteForever: deleteMemoForever,
  },
  getBackupData: getAllMemoDataForBackup,
}

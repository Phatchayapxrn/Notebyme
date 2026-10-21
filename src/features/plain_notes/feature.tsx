// =====================================================================
// feature.tsx (plain_notes) : ข้อมูลของระบบ "โน๊ตทั่วไป" สำหรับลงทะเบียนในแอพ
// เริ่มต้นล็อกไว้ให้เฉพาะยศ (ดู supabase/sql/005_new_features_locked.sql)
// =====================================================================
import { StickyNote } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { PlainNotesPage } from './pages/PlainNotesPage'
import { searchPlainNotes } from './search'
import { bringPlainNoteBack, deletePlainNoteForever, getAllPlainNotesForBackup, getPlainNoteTrashItems } from './database'

export const plainNotesFeature: AppFeature = {
  id: 'plain_notes',
  menuName: 'โน๊ตเร็ว',
  menuIcon: StickyNote,
  mainPath: '/plain-notes',
  menuOrder: 7,
  pages: [{ path: '/plain-notes', element: <PlainNotesPage /> }],
  searchItems: searchPlainNotes,
  trashActions: {
    kindName: 'โน๊ตทั่วไป',
    kindEmoji: '📝',
    getTrashItems: getPlainNoteTrashItems,
    bringBackFromTrash: bringPlainNoteBack,
    deleteForever: deletePlainNoteForever,
  },
  getBackupData: getAllPlainNotesForBackup,
}

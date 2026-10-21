// =====================================================================
// feature.tsx (mails) : ข้อมูลของระบบ "เก็บเมล" สำหรับลงทะเบียนในแอพ
// เริ่มต้นล็อกไว้ให้เฉพาะยศ (ดู supabase/sql/005_new_features_locked.sql)
// =====================================================================
import { Mail } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { MailsPage } from './pages/MailsPage'
import { searchMails } from './search'
import { bringMailSetBack, deleteMailSetForever, getAllMailSetsForBackup, getMailTrashItems } from './database'

export const mailsFeature: AppFeature = {
  id: 'mails',
  menuName: 'เมล',
  menuIcon: Mail,
  mainPath: '/mails',
  menuOrder: 6,
  pages: [{ path: '/mails', element: <MailsPage /> }],
  searchItems: searchMails,
  trashActions: {
    kindName: 'ชุดเมล',
    kindEmoji: '✉️',
    getTrashItems: getMailTrashItems,
    bringBackFromTrash: bringMailSetBack,
    deleteForever: deleteMailSetForever,
  },
  getBackupData: getAllMailSetsForBackup,
}

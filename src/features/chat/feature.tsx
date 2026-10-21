// =====================================================================
// feature.tsx (chat) : ข้อมูลของระบบ "แชท" สำหรับลงทะเบียนในแอพ
// เริ่มต้นล็อกไว้ให้เฉพาะยศ (ดู supabase/sql/005_new_features_locked.sql)
// =====================================================================
import { MessageCircle } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { ChatPage } from './pages/ChatPage'
import { searchChat } from './search'
import { bringChatItemBack, deleteChatItemForever, getAllChatForBackup, getChatTrashItems } from './database'

export const chatFeature: AppFeature = {
  id: 'chat',
  menuName: 'แชท',
  menuIcon: MessageCircle,
  mainPath: '/chat',
  menuOrder: 10,
  pages: [{ path: '/chat', element: <ChatPage /> }],
  searchItems: searchChat,
  trashActions: {
    kindName: 'แชท',
    kindEmoji: '💬',
    getTrashItems: getChatTrashItems,
    bringBackFromTrash: bringChatItemBack,
    deleteForever: deleteChatItemForever,
  },
  getBackupData: getAllChatForBackup,
}

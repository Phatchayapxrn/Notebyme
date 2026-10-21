// =====================================================================
// feature.tsx (calendar) : ข้อมูลของระบบ "ปฏิทิน" สำหรับลงทะเบียนในแอพ
// เริ่มต้นล็อกไว้ให้เฉพาะยศ (ดู supabase/sql/005_new_features_locked.sql)
// =====================================================================
import { CalendarDays } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { CalendarPage } from './pages/CalendarPage'
import { EventReminders } from './parts/EventReminders'
import { searchCalendar } from './search'
import { bringEventBack, deleteEventForever, getAllEventsForBackup, getEventTrashItems } from './database'

export const calendarFeature: AppFeature = {
  id: 'calendar',
  menuName: 'ปฏิทิน',
  menuIcon: CalendarDays,
  mainPath: '/calendar',
  menuOrder: 11,
  pages: [{ path: '/calendar', element: <CalendarPage /> }],
  backgroundPart: EventReminders,
  searchItems: searchCalendar,
  trashActions: {
    kindName: 'กิจกรรม',
    kindEmoji: '📅',
    getTrashItems: getEventTrashItems,
    bringBackFromTrash: bringEventBack,
    deleteForever: deleteEventForever,
  },
  getBackupData: getAllEventsForBackup,
}

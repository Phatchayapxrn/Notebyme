// =====================================================================
// feature.tsx (tasks) : ข้อมูลของระบบ "สิ่งที่ต้องทำ" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { ListTodo } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { TasksPage } from './pages/TasksPage'
import { TasksHomeCard, TasksSummaryCard } from './parts/TasksSummaryCard'
import { bringTaskBack, deleteTaskForever, getAllTasksForBackup, getTasksInTrash } from './database'

export const tasksFeature: AppFeature = {
  id: 'tasks',
  menuName: 'งาน',
  menuIcon: ListTodo,
  mainPath: '/tasks',
  menuOrder: 3,
  pages: [{ path: '/tasks', element: <TasksPage /> }],
  homeCard: TasksHomeCard,
  sideCard: TasksSummaryCard,
  trashActions: {
    kindName: 'งาน',
    kindEmoji: '✅',
    getTrashItems: getTasksInTrash,
    bringBackFromTrash: bringTaskBack,
    deleteForever: deleteTaskForever,
  },
  getBackupData: getAllTasksForBackup,
}

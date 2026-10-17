// =====================================================================
// feature.ts (notes) : ข้อมูลของระบบ "ไอเดีย" สำหรับลงทะเบียนในแอพ
// =====================================================================
import { Lightbulb } from 'lucide-react'
import type { AppFeature } from '../AppFeature'
import { NotesPage } from './pages/NotesPage'
import { NoteEditPage } from './pages/NoteEditPage'
import { NotesHomeCard } from './parts/NotesHomeCard'
import { bringNoteBack, deleteNoteForever, getAllNotesForBackup, getNotesInTrash } from './database'

export const notesFeature: AppFeature = {
  id: 'notes',
  menuName: 'ไอเดีย',
  menuIcon: Lightbulb,
  mainPath: '/notes',
  menuOrder: 2,
  pages: [
    { path: '/notes', element: <NotesPage /> },
    { path: '/notes/:noteId', element: <NoteEditPage /> },
  ],
  homeCard: NotesHomeCard,
  trashActions: {
    kindName: 'ไอเดีย',
    kindEmoji: '💡',
    getTrashItems: getNotesInTrash,
    bringBackFromTrash: bringNoteBack,
    deleteForever: deleteNoteForever,
  },
  getBackupData: getAllNotesForBackup,
}

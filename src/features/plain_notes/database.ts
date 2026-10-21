// =====================================================================
// database.ts (plain_notes) : อ่าน / เพิ่ม / แก้ / ลบ โน๊ตทั่วไป (ตาราง plain_notes)
// ใช้ชั้นออฟไลน์ (offlineData) → ใช้ได้ตอนไม่มีเน็ต แล้วซิงค์ทีหลัง
// =====================================================================
import { deleteRow, insertRow, listRows, updateRow } from '@/shared/offline/offlineData'
import type { Row } from '@/shared/offline/localStore'
import type { TrashItem } from '../AppFeature'
import { getNoteTitle, type PlainNote } from './types'

export const PLAIN_NOTES_TABLE = 'plain_notes'

function rowToNote(row: Row): PlainNote {
  return {
    id: row.id,
    text: (row.text as string) ?? '',
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  }
}

/** ดึงโน๊ตทั้งหมด (ที่ไม่อยู่ในถังขยะ) ปักหมุดอยู่บน แล้วเรียงใหม่สุดก่อน */
export async function getAllPlainNotes(): Promise<PlainNote[]> {
  const rows = await listRows(PLAIN_NOTES_TABLE)
  return rows
    .filter((row) => !row.deleted_at)
    .map(rowToNote)
    .sort((first, second) => Number(second.isPinned) - Number(first.isPinned) || second.updatedAt.localeCompare(first.updatedAt))
}

/** เพิ่มโน๊ตเปล่า คืน id */
export async function addPlainNote(): Promise<string> {
  return insertRow(PLAIN_NOTES_TABLE, { text: '', is_pinned: false })
}

/** บันทึกข้อความ */
export async function savePlainNoteText(noteId: string, text: string) {
  await updateRow(PLAIN_NOTES_TABLE, noteId, { text })
}

/** ปักหมุด / เลิกปักหมุด */
export async function setPlainNotePinned(noteId: string, isPinned: boolean) {
  await updateRow(PLAIN_NOTES_TABLE, noteId, { is_pinned: isPinned })
}

/** ย้ายไปถังขยะ */
export async function movePlainNoteToTrash(noteId: string) {
  await updateRow(PLAIN_NOTES_TABLE, noteId, { deleted_at: new Date().toISOString() })
}

// ---------------------------------------------------------------------
// ถังขยะ + สำรองข้อมูล
// ---------------------------------------------------------------------

export async function getPlainNoteTrashItems(): Promise<TrashItem[]> {
  const rows = await listRows(PLAIN_NOTES_TABLE)
  return rows
    .filter((row) => row.deleted_at)
    .sort((first, second) => String(second.deleted_at).localeCompare(String(first.deleted_at)))
    .map((row) => {
      const note = rowToNote(row)
      return {
        id: note.id,
        title: getNoteTitle(note),
        previewText: note.text.slice(0, 80),
        deletedAt: row.deleted_at as string,
      }
    })
}

export async function bringPlainNoteBack(noteId: string) {
  await updateRow(PLAIN_NOTES_TABLE, noteId, { deleted_at: null })
}

export async function deletePlainNoteForever(noteId: string) {
  await deleteRow(PLAIN_NOTES_TABLE, noteId)
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllPlainNotesForBackup() {
  return listRows(PLAIN_NOTES_TABLE)
}

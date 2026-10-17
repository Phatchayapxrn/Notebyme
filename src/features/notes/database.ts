// =====================================================================
// database.ts (notes) : อ่าน / เพิ่ม / แก้ / ลบ โน๊ต ในฐานข้อมูล
//
// การลบมี 2 แบบ:
//   moveNoteToTrash   = ย้ายไปถังขยะ (กู้คืนได้ภายใน 30 วัน)
//   deleteNoteForever = ลบถาวร (ลบรูป/วิดีโอในโน๊ตด้วย)
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import { deleteAllFilesOf } from '@/shared/files/fileStorage'
import type { Note, NoteChanges, NoteSummary } from './types'

const TABLE_NAME = 'notes'

/** คอลัมน์ที่ใช้ในหน้ารายการ (ไม่เอา content เพราะใหญ่) */
const SUMMARY_COLUMNS = 'id, title, plain_text, group_id, is_pinned, first_picture, created_at, updated_at'

/** แปลงข้อมูลจากฐานข้อมูล → แบบที่ใช้ในโค้ด */
function rowToNoteSummary(row: Record<string, unknown>): NoteSummary {
  return {
    id: row.id as string,
    title: row.title as string,
    plainText: row.plain_text as string,
    groupId: row.group_id as string | null,
    isPinned: row.is_pinned as boolean,
    firstPicture: row.first_picture as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

/** ดึงโน๊ตทั้งหมด (ที่ไม่อยู่ในถังขยะ) เรียงจากแก้ล่าสุด */
export async function getAllNotes(): Promise<NoteSummary[]> {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select(SUMMARY_COLUMNS)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map(rowToNoteSummary)
}

/** ดึงโน๊ต 1 อัน แบบเต็ม (ไม่เจอ = null) */
export async function getOneNote(noteId: string): Promise<Note | null> {
  const { data, error } = await database.from(TABLE_NAME).select('*').eq('id', noteId).maybeSingle()
  stopIfError(error)
  if (!data) return null
  return { ...rowToNoteSummary(data), content: data.content }
}

/** สร้างโน๊ตเปล่าอันใหม่ แล้วคืน id กลับไป */
export async function addNewNote(groupId: string | null): Promise<string> {
  const { data, error } = await database.from(TABLE_NAME).insert({ group_id: groupId }).select('id').single()
  stopIfError(error)
  tellListChanged(TABLE_NAME)
  return data!.id as string
}

/** บันทึกการแก้ไขโน๊ต */
export async function saveNote(noteId: string, changes: NoteChanges) {
  const { error } = await database
    .from(TABLE_NAME)
    .update({
      title: changes.title,
      content: changes.content,
      plain_text: changes.plainText,
      first_picture: changes.firstPicture,
      group_id: changes.groupId,
      is_pinned: changes.isPinned,
    })
    .eq('id', noteId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ปักหมุด / เลิกปักหมุด */
export async function pinNote(noteId: string, isPinned: boolean) {
  const { error } = await database.from(TABLE_NAME).update({ is_pinned: isPinned }).eq('id', noteId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ย้ายโน๊ตไปถังขยะ */
export async function moveNoteToTrash(noteId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: new Date().toISOString() }).eq('id', noteId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** กู้โน๊ตคืนจากถังขยะ */
export async function bringNoteBack(noteId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: null }).eq('id', noteId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ลบโน๊ตถาวร (ลบรูป/วิดีโอที่แนบด้วย) */
export async function deleteNoteForever(noteId: string) {
  await deleteAllFilesOf({ belongsToType: 'note', belongsToId: noteId })
  const { error } = await database.from(TABLE_NAME).delete().eq('id', noteId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ดึงโน๊ตที่อยู่ในถังขยะ */
export async function getNotesInTrash() {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select('id, title, plain_text, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) || 'ไอเดียไม่มีชื่อ',
    previewText: (row.plain_text as string).slice(0, 80),
    deletedAt: row.deleted_at as string,
  }))
}

/** ดึงโน๊ตทั้งหมดแบบเต็ม (สำหรับสำรองข้อมูล) */
export async function getAllNotesForBackup() {
  const { data, error } = await database.from(TABLE_NAME).select('*').order('created_at')
  stopIfError(error)
  return data ?? []
}

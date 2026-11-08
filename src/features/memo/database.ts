// =====================================================================
// database.ts (memo) : อ่าน / เพิ่ม / แก้ / ลบ โน๊ตและโฟลเดอร์ (ตาราง memos, memo_folders)
// ใช้ชั้นออฟไลน์ (offlineData) → ใช้ได้ตอนไม่มีเน็ต แล้วซิงค์ทีหลัง
// =====================================================================
import { deleteRow, insertRow, listRows, updateRow } from '@/shared/offline/offlineData'
import type { Row } from '@/shared/offline/localStore'
import { deleteAllFilesOf } from '@/shared/files/fileStorage'
import type { JSONContent } from '@tiptap/react'
import type { TrashItem } from '../AppFeature'
import { getMemoTitle, type Memo, type MemoContent, type MemoFolder } from './types'

export const MEMOS_TABLE = 'memos'
export const FOLDERS_TABLE = 'memo_folders'

/** ชื่อประเภทของไฟล์แนบ (ใช้กับตาราง files) */
export const MEMO_FILE_TYPE = 'memo'

function rowToMemo(row: Row): Memo {
  return {
    id: row.id,
    folderId: (row.folder_id as string | null) ?? null,
    content: (row.content as JSONContent | null) ?? null,
    plainText: (row.plain_text as string) ?? '',
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
  }
}

function rowToFolder(row: Row): MemoFolder {
  return {
    id: row.id,
    name: (row.name as string) ?? '',
    emoji: (row.emoji as string) || '📁',
    orderNumber: Number(row.order_number ?? 0),
  }
}

// ---------------------------------------------------------------------
// โน๊ต
// ---------------------------------------------------------------------

/** ดึงโน๊ตทั้งหมด (ที่ไม่อยู่ในถังขยะ) เรียงใหม่สุดก่อน */
export async function getAllMemos(): Promise<Memo[]> {
  const rows = await listRows(MEMOS_TABLE)
  return rows
    .filter((row) => !row.deleted_at)
    .map(rowToMemo)
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
}

/** ดึงโน๊ต 1 อัน (ไม่เจอ = null) */
export async function getOneMemo(memoId: string): Promise<Memo | null> {
  const memos = await getAllMemos()
  return memos.find((memo) => memo.id === memoId) ?? null
}

/** เพิ่มโน๊ตเปล่า (ใส่โฟลเดอร์ได้) คืน id */
export async function addMemo(folderId: string | null): Promise<string> {
  return insertRow(MEMOS_TABLE, { folder_id: folderId, content: null, plain_text: '', is_pinned: false })
}

/** บันทึกเนื้อหา */
export async function saveMemoContent(memoId: string, { content, plainText }: MemoContent) {
  await updateRow(MEMOS_TABLE, memoId, { content, plain_text: plainText })
}

/** ปักหมุด / เลิกปักหมุด */
export async function setMemoPinned(memoId: string, isPinned: boolean) {
  await updateRow(MEMOS_TABLE, memoId, { is_pinned: isPinned })
}

/** ย้ายไปโฟลเดอร์อื่น (null = ไม่จัดหมวด) */
export async function moveMemoToFolder(memoId: string, folderId: string | null) {
  await updateRow(MEMOS_TABLE, memoId, { folder_id: folderId })
}

/** ย้ายไปถังขยะ */
export async function moveMemoToTrash(memoId: string) {
  await updateRow(MEMOS_TABLE, memoId, { deleted_at: new Date().toISOString() })
}

/** ลบถาวร (ลบไฟล์ที่แนบด้วย) */
export async function deleteMemoForever(memoId: string) {
  await deleteAllFilesOf({ belongsToType: MEMO_FILE_TYPE, belongsToId: memoId })
  await deleteRow(MEMOS_TABLE, memoId)
}

// ---------------------------------------------------------------------
// โฟลเดอร์
// ---------------------------------------------------------------------

/** ดึงโฟลเดอร์ทั้งหมด เรียงตามลำดับ */
export async function getAllFolders(): Promise<MemoFolder[]> {
  const rows = await listRows(FOLDERS_TABLE)
  return rows
    .filter((row) => !row.deleted_at)
    .map(rowToFolder)
    .sort((first, second) => first.orderNumber - second.orderNumber)
}

/** เพิ่มโฟลเดอร์ใหม่ไว้ท้ายสุด */
export async function addFolder(name: string, emoji: string): Promise<string> {
  const folders = await getAllFolders()
  const lastOrder = folders.reduce((biggest, folder) => Math.max(biggest, folder.orderNumber), 0)
  return insertRow(FOLDERS_TABLE, { name, emoji, order_number: lastOrder + 1 })
}

/** แก้ชื่อ / อีโมจิ ของโฟลเดอร์ */
export async function saveFolder(folderId: string, changes: { name: string; emoji: string }) {
  await updateRow(FOLDERS_TABLE, folderId, changes)
}

/** ลบโฟลเดอร์ (โน๊ตข้างในไม่หาย จะกลายเป็น "ไม่จัดหมวด") */
export async function deleteFolder(folderId: string) {
  const memos = await listRows(MEMOS_TABLE)
  for (const row of memos) {
    if (row.folder_id === folderId) await updateRow(MEMOS_TABLE, row.id, { folder_id: null })
  }
  await deleteRow(FOLDERS_TABLE, folderId)
}

// ---------------------------------------------------------------------
// ถังขยะ + สำรองข้อมูล
// ---------------------------------------------------------------------

export async function getMemoTrashItems(): Promise<TrashItem[]> {
  const rows = await listRows(MEMOS_TABLE)
  return rows
    .filter((row) => row.deleted_at)
    .sort((first, second) => String(second.deleted_at).localeCompare(String(first.deleted_at)))
    .map((row) => {
      const memo = rowToMemo(row)
      return {
        id: memo.id,
        title: getMemoTitle(memo),
        previewText: memo.plainText.slice(0, 80),
        deletedAt: row.deleted_at as string,
      }
    })
}

export async function bringMemoBack(memoId: string) {
  await updateRow(MEMOS_TABLE, memoId, { deleted_at: null })
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllMemoDataForBackup() {
  return { folders: await listRows(FOLDERS_TABLE), memos: await listRows(MEMOS_TABLE) }
}

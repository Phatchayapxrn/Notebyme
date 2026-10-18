// =====================================================================
// database.ts (future) : อ่าน / เพิ่ม / แก้ / ลบ ข้อความถึงตัวเองในอนาคต
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import { daysUntil } from '@/shared/dateTools'
import type { FutureMessage, NewFutureMessage } from './types'

const TABLE_NAME = 'future_messages'

/** แปลงข้อมูลจากฐานข้อมูล → แบบที่ใช้ในโค้ด */
function rowToMessage(row: Record<string, unknown>): FutureMessage {
  return {
    id: row.id as string,
    text: row.text as string,
    showDate: row.show_date as string,
    isRead: row.is_read as boolean,
    createdAt: row.created_at as string,
  }
}

/** ดึงข้อความทั้งหมด (ที่ไม่อยู่ในถังขยะ) เรียงตามวันที่จะเปิด */
export async function getAllFutureMessages(): Promise<FutureMessage[]> {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select('id, text, show_date, is_read, created_at')
    .is('deleted_at', null)
    .order('show_date', { ascending: true })
  stopIfError(error)
  return (data ?? []).map(rowToMessage)
}

/** เขียนข้อความใหม่ */
export async function addFutureMessage(newMessage: NewFutureMessage) {
  const { error } = await database.from(TABLE_NAME).insert({ text: newMessage.text, show_date: newMessage.showDate })
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** แก้ไขข้อความ / วันที่ (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function saveFutureMessage(messageId: string, changes: Partial<NewFutureMessage>) {
  const row: Record<string, unknown> = {}
  if (changes.text !== undefined) row.text = changes.text
  if (changes.showDate !== undefined) {
    row.show_date = changes.showDate
    row.is_read = false // เลื่อนวันใหม่ = ยังไม่ได้อ่าน
  }
  const { error } = await database.from(TABLE_NAME).update(row).eq('id', messageId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ทำเครื่องหมายว่าอ่านแล้ว */
export async function markFutureMessageRead(messageId: string) {
  const { error } = await database.from(TABLE_NAME).update({ is_read: true }).eq('id', messageId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ย้ายไปถังขยะ */
export async function moveFutureMessageToTrash(messageId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: new Date().toISOString() }).eq('id', messageId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** กู้คืนจากถังขยะ */
export async function bringFutureMessageBack(messageId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: null }).eq('id', messageId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ลบถาวร */
export async function deleteFutureMessageForever(messageId: string) {
  const { error } = await database.from(TABLE_NAME).delete().eq('id', messageId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ดึงข้อความที่อยู่ในถังขยะ */
export async function getFutureMessagesInTrash() {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select('id, text, show_date, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.text as string).split('\n')[0].slice(0, 60) || '(ไม่มีข้อความ)',
    previewText: `เปิดอ่านวันที่ ${row.show_date as string}`,
    deletedAt: row.deleted_at as string,
  }))
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllFutureMessagesForBackup() {
  const { data, error } = await database.from(TABLE_NAME).select('*').order('created_at')
  stopIfError(error)
  return data ?? []
}

/** true = ถึงวันเปิดอ่านแล้ว */
export function isOpenNow(message: FutureMessage): boolean {
  return daysUntil(message.showDate) <= 0
}
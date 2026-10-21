// =====================================================================
// database.ts (chat) : อ่าน / เพิ่ม / แก้ / ลบ ห้องแชทและข้อความ
//   ตาราง chat_rooms และ chat_messages
// ใช้ชั้นออฟไลน์ (offlineData) → ส่งข้อความตอนไม่มีเน็ตได้ แล้วซิงค์ทีหลัง
// (แนบรูป/วิดีโอต้องมีเน็ต เพราะต้องอัปโหลดไฟล์)
//
// ถังขยะ: ห้องกับข้อความอยู่ในถังเดียวกัน แยกด้วยคำนำหน้า id  "room:..."  /  "msg:..."
// =====================================================================
import { deleteAllFilesOf } from '@/shared/files/fileStorage'
import { deleteRow, insertRow, listRows, updateRow } from '@/shared/offline/offlineData'
import type { Row } from '@/shared/offline/localStore'
import type { TrashItem } from '../AppFeature'
import type { ChatAttachment, ChatMessage, ChatRoom } from './types'

export const ROOMS_TABLE = 'chat_rooms'
export const MESSAGES_TABLE = 'chat_messages'

/** ประเภทเจ้าของไฟล์ ในตาราง files */
export const CHAT_FILE_TYPE = 'chat'

function rowToMessage(row: Row): ChatMessage {
  return {
    id: row.id,
    roomId: row.room_id as string,
    text: (row.text as string) ?? '',
    attachments: (row.attachments as ChatAttachment[]) ?? [],
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at as string,
    isEdited: Boolean(row.edited_at),
  }
}

/** ข้อความสั้นๆ สำหรับโชว์ตัวอย่างในรายการห้อง */
function previewOf(message: ChatMessage): string {
  if (message.text.trim()) return message.text.trim().split('\n')[0].slice(0, 60)
  return message.attachments.length > 0 ? '📎 ไฟล์แนบ' : ''
}

// ---------------------------------------------------------------------
// ห้อง
// ---------------------------------------------------------------------

/** ดึงห้องทั้งหมด (ที่ไม่อยู่ในถังขยะ) ห้องที่มีข้อความล่าสุดอยู่บน */
export async function getAllRooms(): Promise<ChatRoom[]> {
  const [roomRows, messageRows] = await Promise.all([listRows(ROOMS_TABLE), listRows(MESSAGES_TABLE)])

  // ข้อความล่าสุดของแต่ละห้อง
  const lastMessage = new Map<string, ChatMessage>()
  for (const row of messageRows) {
    if (row.deleted_at) continue
    const message = rowToMessage(row)
    const old = lastMessage.get(message.roomId)
    if (!old || message.createdAt > old.createdAt) lastMessage.set(message.roomId, message)
  }

  return roomRows
    .filter((row) => !row.deleted_at)
    .map((row) => {
      const last = lastMessage.get(row.id)
      return {
        id: row.id,
        name: (row.name as string) ?? '',
        createdAt: row.created_at as string,
        lastTime: last?.createdAt ?? (row.created_at as string),
        lastText: last ? previewOf(last) : '',
      }
    })
    .sort((first, second) => second.lastTime.localeCompare(first.lastTime))
}

export async function addRoom(name: string): Promise<string> {
  return insertRow(ROOMS_TABLE, { name })
}

export async function renameRoom(roomId: string, name: string) {
  await updateRow(ROOMS_TABLE, roomId, { name })
}

export async function moveRoomToTrash(roomId: string) {
  await updateRow(ROOMS_TABLE, roomId, { deleted_at: new Date().toISOString() })
}

// ---------------------------------------------------------------------
// ข้อความ
// ---------------------------------------------------------------------

/** ดึงข้อความของห้อง (ที่ไม่อยู่ในถังขยะ) เก่าสุดอยู่บน */
export async function getMessagesOfRoom(roomId: string): Promise<ChatMessage[]> {
  const rows = await listRows(MESSAGES_TABLE)
  return rows
    .filter((row) => row.room_id === roomId && !row.deleted_at)
    .map(rowToMessage)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt))
}

/**
 * ส่งข้อความ
 * messageId = ใส่มาเมื่ออัปโหลดไฟล์ไปก่อนแล้ว (ไฟล์ผูกกับ id นี้) ไม่ใส่ = สร้างให้เอง
 */
export async function sendMessage(roomId: string, text: string, attachments: ChatAttachment[] = [], messageId?: string) {
  await insertRow(MESSAGES_TABLE, { ...(messageId ? { id: messageId } : {}), room_id: roomId, text, attachments, is_pinned: false })
}

export async function editMessage(messageId: string, text: string) {
  await updateRow(MESSAGES_TABLE, messageId, { text, edited_at: new Date().toISOString() })
}

export async function setMessagePinned(messageId: string, isPinned: boolean) {
  await updateRow(MESSAGES_TABLE, messageId, { is_pinned: isPinned })
}

export async function moveMessageToTrash(messageId: string) {
  await updateRow(MESSAGES_TABLE, messageId, { deleted_at: new Date().toISOString() })
}

// ---------------------------------------------------------------------
// ถังขยะ + สำรองข้อมูล
// ---------------------------------------------------------------------

export async function getChatTrashItems(): Promise<TrashItem[]> {
  const [roomRows, messageRows] = await Promise.all([listRows(ROOMS_TABLE), listRows(MESSAGES_TABLE)])
  const aliveRoomIds = new Set(roomRows.filter((row) => !row.deleted_at).map((row) => row.id))

  const roomItems = roomRows
    .filter((row) => row.deleted_at)
    .map((row) => ({
      id: `room:${row.id}`,
      title: `ห้อง ${(row.name as string) || '(ไม่มีชื่อ)'}`,
      previewText: 'ข้อความในห้องจะกลับมาพร้อมกัน',
      deletedAt: row.deleted_at as string,
    }))

  // ข้อความที่ลบเดี่ยวๆ (ห้องยังอยู่) — ข้อความในห้องที่ถูกลบ ไม่ต้องโชว์ซ้ำ
  const messageItems = messageRows
    .filter((row) => row.deleted_at && aliveRoomIds.has(row.room_id as string))
    .map((row) => {
      const message = rowToMessage(row)
      return { id: `msg:${row.id}`, title: previewOf(message) || 'ข้อความ', previewText: undefined, deletedAt: row.deleted_at as string }
    })

  return [...roomItems, ...messageItems].sort((first, second) => second.deletedAt.localeCompare(first.deletedAt))
}

export async function bringChatItemBack(trashId: string) {
  const [kind, id] = trashId.split(':')
  await updateRow(kind === 'room' ? ROOMS_TABLE : MESSAGES_TABLE, id, { deleted_at: null })
}

/** ลบถาวร (ลบไฟล์แนบด้วย) */
export async function deleteChatItemForever(trashId: string) {
  const [kind, id] = trashId.split(':')
  if (kind === 'msg') {
    await deleteAllFilesOf({ belongsToType: CHAT_FILE_TYPE, belongsToId: id }).catch(() => {}) // ไม่มีเน็ต = ข้ามไฟล์ (ไม่ให้ลบข้อความไม่ได้)
    await deleteRow(MESSAGES_TABLE, id)
    return
  }
  // ลบห้อง: ลบข้อความทั้งหมดในห้องก่อน (พร้อมไฟล์แนบ)
  const messageRows = (await listRows(MESSAGES_TABLE)).filter((row) => row.room_id === id)
  for (const row of messageRows) {
    await deleteAllFilesOf({ belongsToType: CHAT_FILE_TYPE, belongsToId: row.id }).catch(() => {})
    await deleteRow(MESSAGES_TABLE, row.id)
  }
  await deleteRow(ROOMS_TABLE, id)
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllChatForBackup() {
  const [rooms, messages] = await Promise.all([listRows(ROOMS_TABLE), listRows(MESSAGES_TABLE)])
  return { rooms, messages }
}

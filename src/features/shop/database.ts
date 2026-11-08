// =====================================================================
// database.ts (shop) : อ่าน / เพิ่ม / แก้ / ลบ ข้อมูลร้านค้า
//   ส่วนที่ 1 : ชุดข้อความ   (ตาราง shop_messages)
//   ส่วนที่ 2 : แคปชั่นโพสต์  (ตาราง shop_captions)
//   ส่วนที่ 4 : ถังขยะ + สำรองข้อมูล (รวม 4 ตาราง)
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import type { CaptionStatus, NewCaption, ShopCaption, ShopMessage } from './types'

export const MESSAGES_TABLE = 'shop_messages'
// ตารางสินค้า/ออเดอร์ยังอยู่ในฐานข้อมูล (ข้อมูลเก่าไม่หาย) แต่ไม่มีหน้าใช้งานแล้ว เหลือไว้แค่ถังขยะกับสำรองข้อมูล
export const PRODUCTS_TABLE = 'shop_products'
export const ORDERS_TABLE = 'shop_orders'
export const CAPTIONS_TABLE = 'shop_captions'

/** ย้ายไปถังขยะ (ใช้ได้ทุกตาราง) */
async function moveToTrash(tableName: string, id: string) {
  const { error } = await database.from(tableName).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  stopIfError(error)
  tellListChanged(tableName)
}

// =====================================================================
// ส่วนที่ 1 : ชุดข้อความ
// =====================================================================

/** ดึงชุดข้อความทั้งหมด เรียงตามลำดับ */
export async function getAllShopMessages(): Promise<ShopMessage[]> {
  const { data, error } = await database
    .from(MESSAGES_TABLE)
    .select('id, title, text, order_number, created_at')
    .is('deleted_at', null)
    .order('order_number', { ascending: true })
    .order('created_at', { ascending: true })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    text: row.text as string,
    orderNumber: row.order_number as number,
    createdAt: row.created_at as string,
  }))
}

/** เพิ่มชุดข้อความใหม่ (orderNumber = ลำดับ ใส่เลขมากสุด+1 จะได้ไปต่อท้าย) */
export async function addShopMessage(newMessage: { title?: string; text: string; orderNumber: number }) {
  const { error } = await database.from(MESSAGES_TABLE).insert({
    title: newMessage.title ?? '',
    text: newMessage.text,
    order_number: newMessage.orderNumber,
  })
  stopIfError(error)
  tellListChanged(MESSAGES_TABLE)
}

/** แก้ชื่อ / ข้อความของชุด */
export async function saveShopMessage(messageId: string, changes: { title: string; text: string }) {
  const { error } = await database.from(MESSAGES_TABLE).update({ title: changes.title, text: changes.text }).eq('id', messageId)
  stopIfError(error)
  tellListChanged(MESSAGES_TABLE)
}

/** สลับลำดับ 2 ชุด (ใช้กับปุ่มเลื่อนขึ้น / ลง) */
export async function swapShopMessages(first: ShopMessage, second: ShopMessage) {
  // ถ้าเลขลำดับเท่ากัน ให้ห่างกัน 1 ก่อน
  const firstNumber = first.orderNumber
  const secondNumber = second.orderNumber === first.orderNumber ? first.orderNumber + 1 : second.orderNumber
  const results = await Promise.all([
    database.from(MESSAGES_TABLE).update({ order_number: secondNumber }).eq('id', first.id),
    database.from(MESSAGES_TABLE).update({ order_number: firstNumber }).eq('id', second.id),
  ])
  results.forEach((result) => stopIfError(result.error))
  tellListChanged(MESSAGES_TABLE)
}

export const moveShopMessageToTrash = (messageId: string) => moveToTrash(MESSAGES_TABLE, messageId)

// =====================================================================
// ส่วนที่ 2 : แคปชั่นโพสต์ (ตาราง shop_captions)
// =====================================================================

/** ดึงแคปชั่นทั้งหมด เรียงตามวันที่โพสต์ (ที่ไม่มีวันอยู่ท้าย) แล้วตามเวลา */
export async function getAllShopCaptions(): Promise<ShopCaption[]> {
  const { data, error } = await database
    .from(CAPTIONS_TABLE)
    .select('id, text, post_date, post_time, status, platforms, remind, category, created_at')
    .is('deleted_at', null)
    .order('post_date', { ascending: true, nullsFirst: false })
    .order('post_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    text: row.text as string,
    postDate: (row.post_date as string | null) ?? null,
    // ฐานข้อมูลส่งเวลามาเป็น "14:30:00" → เอาแค่ "14:30"
    postTime: row.post_time ? (row.post_time as string).slice(0, 5) : null,
    status: row.status as CaptionStatus,
    platforms: (row.platforms as string[] | null) ?? [],
    remind: Boolean(row.remind),
    category: (row.category as string | null) ?? '',
    createdAt: row.created_at as string,
  }))
}

/** แปลงข้อมูลแคปชั่น → ชื่อคอลัมน์ในฐานข้อมูล */
function captionToRow(caption: Partial<NewCaption>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (caption.text !== undefined) row.text = caption.text
  if (caption.postDate !== undefined) row.post_date = caption.postDate
  if (caption.postTime !== undefined) row.post_time = caption.postTime
  if (caption.status !== undefined) row.status = caption.status
  if (caption.platforms !== undefined) row.platforms = caption.platforms
  if (caption.remind !== undefined) row.remind = caption.remind
  if (caption.category !== undefined) row.category = caption.category
  return row
}

/** เพิ่มแคปชั่น */
export async function addShopCaption(newCaption: NewCaption) {
  const { error } = await database.from(CAPTIONS_TABLE).insert(captionToRow(newCaption))
  stopIfError(error)
  tellListChanged(CAPTIONS_TABLE)
}

/** แก้แคปชั่น (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function saveShopCaption(captionId: string, changes: Partial<NewCaption>) {
  const { error } = await database.from(CAPTIONS_TABLE).update(captionToRow(changes)).eq('id', captionId)
  stopIfError(error)
  tellListChanged(CAPTIONS_TABLE)
}

export const moveShopCaptionToTrash = (captionId: string) => moveToTrash(CAPTIONS_TABLE, captionId)

// =====================================================================
// ส่วนที่ 4 : ถังขยะ + สำรองข้อมูล
// ถังขยะของร้านรวม 4 ตารางไว้ด้วยกัน
// id ของในถังขยะเขียนแบบ "ชื่อตาราง:id" เช่น "shop_products:1234-..." จะได้รู้ว่ามาจากตารางไหน
// =====================================================================

/** แต่ละตาราง: เอาคอลัมน์ไหนมาเป็นชื่อในถังขยะ + อีโมจิหน้าชื่อ */
const TRASH_TABLES = [
  { tableName: MESSAGES_TABLE, titleColumn: 'title', textColumn: 'text', emoji: '💬' },
  { tableName: PRODUCTS_TABLE, titleColumn: 'name', textColumn: 'note', emoji: '📦' },
  { tableName: ORDERS_TABLE, titleColumn: 'customer_name', textColumn: 'detail', emoji: '🧾' },
  { tableName: CAPTIONS_TABLE, titleColumn: 'text', textColumn: 'text', emoji: '📅' },
]

/** แยก "ชื่อตาราง:id" ออกเป็น 2 ส่วน */
function splitTrashId(trashId: string) {
  const [tableName, id] = trashId.split(':')
  if (!TRASH_TABLES.some((table) => table.tableName === tableName) || !id) throw new Error('ไม่รู้จักรายการนี้')
  return { tableName, id }
}

/** ดึงของในถังขยะของร้าน (ทั้ง 3 ตาราง) */
export async function getShopTrashItems() {
  const itemsOfEachTable = await Promise.all(
    TRASH_TABLES.map(async (table) => {
      const { data, error } = await database
        .from(table.tableName)
        .select(`id, ${table.titleColumn}, ${table.textColumn}, deleted_at`)
        .not('deleted_at', 'is', null)
      stopIfError(error)
      return ((data ?? []) as unknown as Record<string, string>[]).map((row) => {
        const text = row[table.textColumn] ?? ''
        const title = (row[table.titleColumn] || text).split('\n')[0].slice(0, 60) || '(ไม่มีชื่อ)'
        return {
          id: `${table.tableName}:${row.id}`,
          title: `${table.emoji} ${title}`,
          previewText: text.split('\n')[0].slice(0, 80) || undefined,
          deletedAt: row.deleted_at,
        }
      })
    }),
  )
  return itemsOfEachTable.flat()
}

/** กู้คืนจากถังขยะ */
export async function bringShopItemBack(trashId: string) {
  const { tableName, id } = splitTrashId(trashId)
  const { error } = await database.from(tableName).update({ deleted_at: null }).eq('id', id)
  stopIfError(error)
  tellListChanged(tableName)
}

/** ลบถาวร */
export async function deleteShopItemForever(trashId: string) {
  const { tableName, id } = splitTrashId(trashId)
  const { error } = await database.from(tableName).delete().eq('id', id)
  stopIfError(error)
  tellListChanged(tableName)
}

/** ดึงข้อมูลร้านทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllShopDataForBackup() {
  const [messages, products, orders, captions] = await Promise.all(
    [MESSAGES_TABLE, PRODUCTS_TABLE, ORDERS_TABLE, CAPTIONS_TABLE].map(async (tableName) => {
      const { data, error } = await database.from(tableName).select('*').order('created_at')
      stopIfError(error)
      return data ?? []
    }),
  )
  return { messages, products, orders, captions }
}
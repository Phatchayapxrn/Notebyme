// =====================================================================
// database.ts (shop) : อ่าน / เพิ่ม / แก้ / ลบ ข้อมูลร้านค้า
//   ส่วนที่ 1 : ชุดข้อความ   (ตาราง shop_messages)
//   ส่วนที่ 2 : สินค้า        (ตาราง shop_products)
//   ส่วนที่ 3 : ออเดอร์       (ตาราง shop_orders)
//   ส่วนที่ 4 : ถังขยะ + สำรองข้อมูล (รวม 3 ตาราง)
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import type { NewOrder, NewProduct, Order, Product, ShopMessage } from './types'

export const MESSAGES_TABLE = 'shop_messages'
export const PRODUCTS_TABLE = 'shop_products'
export const ORDERS_TABLE = 'shop_orders'

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
// ส่วนที่ 2 : สินค้า
// =====================================================================

/** ดึงสินค้าทั้งหมด เรียงตามชื่อ */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await database
    .from(PRODUCTS_TABLE)
    .select('id, name, price, stock, note, created_at')
    .is('deleted_at', null)
    .order('name', { ascending: true })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    price: Number(row.price),
    stock: row.stock as number,
    note: row.note as string,
    createdAt: row.created_at as string,
  }))
}

/** เพิ่มสินค้า */
export async function addProduct(newProduct: NewProduct) {
  const { error } = await database.from(PRODUCTS_TABLE).insert(newProduct)
  stopIfError(error)
  tellListChanged(PRODUCTS_TABLE)
}

/** แก้สินค้า (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function saveProduct(productId: string, changes: Partial<NewProduct>) {
  const { error } = await database.from(PRODUCTS_TABLE).update(changes).eq('id', productId)
  stopIfError(error)
  tellListChanged(PRODUCTS_TABLE)
}

export const moveProductToTrash = (productId: string) => moveToTrash(PRODUCTS_TABLE, productId)

// =====================================================================
// ส่วนที่ 3 : ออเดอร์
// =====================================================================

/** ดึงออเดอร์ทั้งหมด ใหม่ล่าสุดก่อน */
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await database
    .from(ORDERS_TABLE)
    .select('id, customer_name, detail, total_price, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    customerName: row.customer_name as string,
    detail: row.detail as string,
    totalPrice: Number(row.total_price),
    status: row.status as Order['status'],
    createdAt: row.created_at as string,
  }))
}

/** แปลงข้อมูลออเดอร์ → ชื่อคอลัมน์ในฐานข้อมูล */
function orderToRow(order: Partial<NewOrder>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (order.customerName !== undefined) row.customer_name = order.customerName
  if (order.detail !== undefined) row.detail = order.detail
  if (order.totalPrice !== undefined) row.total_price = order.totalPrice
  if (order.status !== undefined) row.status = order.status
  return row
}

/** เพิ่มออเดอร์ */
export async function addOrder(newOrder: NewOrder) {
  const { error } = await database.from(ORDERS_TABLE).insert(orderToRow(newOrder))
  stopIfError(error)
  tellListChanged(ORDERS_TABLE)
}

/** แก้ออเดอร์ (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function saveOrder(orderId: string, changes: Partial<NewOrder>) {
  const { error } = await database.from(ORDERS_TABLE).update(orderToRow(changes)).eq('id', orderId)
  stopIfError(error)
  tellListChanged(ORDERS_TABLE)
}

export const moveOrderToTrash = (orderId: string) => moveToTrash(ORDERS_TABLE, orderId)

// =====================================================================
// ส่วนที่ 4 : ถังขยะ + สำรองข้อมูล
// ถังขยะของร้านรวม 3 ตารางไว้ด้วยกัน
// id ของในถังขยะเขียนแบบ "ชื่อตาราง:id" เช่น "shop_products:1234-..." จะได้รู้ว่ามาจากตารางไหน
// =====================================================================

/** แต่ละตาราง: เอาคอลัมน์ไหนมาเป็นชื่อในถังขยะ + อีโมจิหน้าชื่อ */
const TRASH_TABLES = [
  { tableName: MESSAGES_TABLE, titleColumn: 'title', textColumn: 'text', emoji: '💬' },
  { tableName: PRODUCTS_TABLE, titleColumn: 'name', textColumn: 'note', emoji: '📦' },
  { tableName: ORDERS_TABLE, titleColumn: 'customer_name', textColumn: 'detail', emoji: '🧾' },
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
        const title = row[table.titleColumn] || text.split('\n')[0].slice(0, 60) || '(ไม่มีชื่อ)'
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
  const [messages, products, orders] = await Promise.all(
    [MESSAGES_TABLE, PRODUCTS_TABLE, ORDERS_TABLE].map(async (tableName) => {
      const { data, error } = await database.from(tableName).select('*').order('created_at')
      stopIfError(error)
      return data ?? []
    }),
  )
  return { messages, products, orders }
}
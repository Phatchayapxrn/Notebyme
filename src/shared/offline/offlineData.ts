// =====================================================================
// offlineData.ts : อ่าน/เขียนตารางที่ใช้ได้ทั้งตอนออนไลน์และออฟไลน์
//
// ใช้ในไฟล์ database.ts ของแต่ละระบบ แทนการเรียก database.from(...) ตรงๆ:
//   const rows = await listRows('mail_sets')                  // อ่านทั้งตาราง
//   const id   = await insertRow('mail_sets', { title: 'x' }) // เพิ่ม
//   await updateRow('mail_sets', id, { title: 'y' })          // แก้
//   await deleteRow('mail_sets', id)                          // ลบถาวร
//
// ทำงานยังไง:
//   - อ่านได้ → เก็บสำเนาไว้ในเครื่อง / เน็ตหลุด → อ่านจากสำเนา
//   - เขียน → ใส่สำเนาในเครื่องทันที (หน้าจอเปลี่ยนเลย) + ต่อคิว แล้วส่งขึ้นฐานข้อมูล
//     ถ้าส่งไม่ได้ (ออฟไลน์) คิวจะรออยู่ แล้วส่งเองเมื่อเน็ตกลับมา
//   - id สร้างจากฝั่งเครื่อง และส่งแบบ upsert จึงส่งซ้ำได้ ไม่เกิดแถวซ้ำ
//   - แก้ชนกัน: คำสั่งที่ส่งทีหลังชนะ (ฉบับแก้ล่าสุดชนะ)
//
// ข้อจำกัด: ไม่รองรับรูป/ไฟล์ตอนออฟไลน์ (ไฟล์ใหญ่ ต้องอัปโหลดตอนออนไลน์)
// =====================================================================
import { database, getMyUserId, tellListChanged } from '@/shared/database'
import {
  addToQueue,
  readQueue,
  readSnapshot,
  removeFromQueue,
  saveSnapshot,
  type QueuedWrite,
  type Row,
} from './localStore'
import { makeId } from '@/shared/text/makeId'
import { setSyncStatus } from './syncStatus'

/** ดึงจากฐานข้อมูลทีละกี่แถว (Supabase ให้สูงสุด 1000 ต่อครั้ง) */
const PAGE_SIZE = 1000

/** true = error นี้เกิดจากเน็ตหลุด (ไม่ใช่ข้อมูลผิด/ไม่มีสิทธิ์) */
function isNetworkError(error: { message: string }): boolean {
  return !navigator.onLine || /fetch|network|load failed/i.test(error.message)
}

// ---------------------------------------------------------------------
// ส่งคิวขึ้นฐานข้อมูล
// ---------------------------------------------------------------------

/** ส่งคำสั่ง 1 อัน คืน error ถ้าไม่สำเร็จ */
async function sendOneWrite(write: QueuedWrite) {
  const table = database.from(write.tableName)
  if (write.kind === 'insert') {
    const { error } = await table.upsert(write.data, { onConflict: 'id' })
    return error
  }
  if (write.kind === 'update') {
    const { error } = await table.update(write.data).eq('id', write.rowId)
    return error
  }
  const { error } = await table.delete().eq('id', write.rowId)
  return error
}

let isSending = false

/** ส่งคำสั่งที่ค้างในคิวขึ้นฐานข้อมูล (เรียกซ้ำได้ ไม่ทำงานซ้อนกัน) */
export async function sendQueue() {
  if (isSending || !navigator.onLine) return
  isSending = true
  const changedTables = new Set<string>()
  try {
    const userId = await getMyUserId()
    setSyncStatus({ isSending: true })
    for (const write of await readQueue()) {
      if (write.userId !== userId) continue
      const error = await sendOneWrite(write)
      if (error && isNetworkError(error)) break // เน็ตหลุดกลางทาง รอรอบหน้า
      if (error) console.error('ส่งคำสั่งขึ้นฐานข้อมูลไม่สำเร็จ (ข้ามไป):', write, error.message)
      await removeFromQueue(write.key!)
      changedTables.add(write.tableName)
    }
  } catch {
    // ยังไม่ได้ล็อกอิน / เปิดฐานข้อมูลในเครื่องไม่ได้ → ไว้ลองใหม่รอบหน้า
  } finally {
    isSending = false
    await refreshPendingCount()
    changedTables.forEach(tellListChanged)
  }
}

/** นับคำสั่งที่ยังค้างอยู่ แล้วอัปเดตป้ายสถานะ */
export async function refreshPendingCount() {
  try {
    const pendingCount = (await readQueue()).length
    setSyncStatus({ pendingCount, isSending: false })
  } catch {
    setSyncStatus({ isSending: false })
  }
}

// ---------------------------------------------------------------------
// อ่าน
// ---------------------------------------------------------------------

/** อ่านทุกแถวของตาราง (รวมที่อยู่ในถังขยะ — ให้แต่ละระบบกรองเอง) */
export async function listRows(tableName: string): Promise<Row[]> {
  const userId = await getMyUserId()
  await sendQueue()

  // ยังมีคำสั่งค้างอยู่ → ใช้สำเนาในเครื่อง (มีส่วนที่เพิ่งแก้ครบ) ห้ามเอาของเก่าจากฐานข้อมูลมาทับ
  const hasPending = (await readQueue()).some((write) => write.userId === userId)
  if (hasPending) return (await readSnapshot(userId, tableName)) ?? []

  const allRows: Row[] = []
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await database
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(start, start + PAGE_SIZE - 1)
    if (error) {
      if (isNetworkError(error)) return (await readSnapshot(userId, tableName)) ?? []
      throw new Error(error.message)
    }
    allRows.push(...(data as Row[]))
    if (!data || data.length < PAGE_SIZE) break
  }
  await saveSnapshot(userId, tableName, allRows)
  return allRows
}

// ---------------------------------------------------------------------
// เขียน
// ---------------------------------------------------------------------

/** ใส่ผลลง "สำเนาในเครื่อง" ทันที แล้วต่อคิว + พยายามส่ง */
async function writeRow(write: QueuedWrite, changeSnapshot: (rows: Row[]) => Row[]) {
  const oldRows = (await readSnapshot(write.userId, write.tableName)) ?? []
  await saveSnapshot(write.userId, write.tableName, changeSnapshot(oldRows))
  await addToQueue(write)
  await refreshPendingCount()
  tellListChanged(write.tableName)
  void sendQueue()
}

/** เพิ่มแถวใหม่ คืน id ของแถวที่เพิ่ม (ถ้าใส่ id มาใน data จะใช้ id นั้น — เช่นตอนต้องรู้ id ก่อนอัปโหลดไฟล์) */
export async function insertRow(tableName: string, data: Record<string, unknown>): Promise<string> {
  const userId = await getMyUserId()
  const now = new Date().toISOString()
  const row: Row = {
    deleted_at: null,
    created_at: now,
    ...data,
    updated_at: now,
    id: typeof data.id === 'string' ? data.id : makeId(),
    user_id: userId,
  }
  await writeRow({ userId, tableName, kind: 'insert', rowId: row.id, data: row }, (rows) => [...rows, row])
  return row.id
}

/** แก้แถว (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function updateRow(tableName: string, rowId: string, changes: Record<string, unknown>) {
  const userId = await getMyUserId()
  const data = { ...changes, updated_at: new Date().toISOString() }
  await writeRow({ userId, tableName, kind: 'update', rowId, data }, (rows) =>
    rows.map((row) => (row.id === rowId ? { ...row, ...data } : row)),
  )
}

/** ลบแถวถาวร */
export async function deleteRow(tableName: string, rowId: string) {
  const userId = await getMyUserId()
  await writeRow({ userId, tableName, kind: 'delete', rowId, data: {} }, (rows) =>
    rows.filter((row) => row.id !== rowId),
  )
}

// ---------------------------------------------------------------------
// เริ่มทำงาน: ส่งคิวเมื่อเน็ตกลับมา / กลับมาเปิดแอพ (เรียกครั้งเดียวตอนเปิดเว็บ)
// ---------------------------------------------------------------------
export function startOfflineSync() {
  window.addEventListener('online', () => void sendQueue())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sendQueue()
  })
  void refreshPendingCount().then(sendQueue)
}

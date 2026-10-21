// =====================================================================
// localStore.ts : ที่เก็บข้อมูลในเครื่อง (IndexedDB) สำหรับใช้ตอนออฟไลน์
//
// มี 2 ที่เก็บ:
//   snapshots = สำเนารายการของแต่ละตาราง (อ่านตอนออฟไลน์)
//   queue     = คำสั่งเขียนที่ยังส่งขึ้นฐานข้อมูลไม่ได้ (รอเน็ตกลับมา)
// =====================================================================

/** แถวข้อมูลจากฐานข้อมูล (ต้องมี id) */
export type Row = { id: string } & Record<string, unknown>

/** คำสั่งเขียนที่รอส่ง */
export interface QueuedWrite {
  /** เลขลำดับ (ใส่ให้เองตอนเก็บ) */
  key?: number
  userId: string
  tableName: string
  kind: 'insert' | 'update' | 'delete'
  rowId: string
  /** insert = แถวเต็ม / update = เฉพาะส่วนที่เปลี่ยน / delete = ไม่ใช้ */
  data: Record<string, unknown>
}

const DATABASE_NAME = 'notebyme-offline'
const SNAPSHOTS = 'snapshots'
const QUEUE = 'queue'

let openingPromise: Promise<IDBDatabase> | null = null

function openLocalDatabase(): Promise<IDBDatabase> {
  if (openingPromise) return openingPromise
  openingPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore(SNAPSHOTS)
      db.createObjectStore(QUEUE, { keyPath: 'key', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      openingPromise = null
      reject(request.error)
    }
  })
  return openingPromise
}

/** ครอบ request ของ IndexedDB ให้ใช้กับ await ได้ */
function waitFor<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function snapshotName(userId: string, tableName: string) {
  return `${userId}:${tableName}`
}

/** อ่านสำเนารายการของตาราง (ไม่มี = null) */
export async function readSnapshot(userId: string, tableName: string): Promise<Row[] | null> {
  const db = await openLocalDatabase()
  const rows = await waitFor(db.transaction(SNAPSHOTS).objectStore(SNAPSHOTS).get(snapshotName(userId, tableName)))
  return (rows as Row[] | undefined) ?? null
}

/** เก็บสำเนารายการของตาราง */
export async function saveSnapshot(userId: string, tableName: string, rows: Row[]) {
  const db = await openLocalDatabase()
  await waitFor(db.transaction(SNAPSHOTS, 'readwrite').objectStore(SNAPSHOTS).put(rows, snapshotName(userId, tableName)))
}

/** ต่อคำสั่งเขียนท้ายคิว */
export async function addToQueue(write: QueuedWrite) {
  const db = await openLocalDatabase()
  await waitFor(db.transaction(QUEUE, 'readwrite').objectStore(QUEUE).add(write))
}

/** คำสั่งที่รออยู่ทั้งหมด เรียงตามลำดับที่เขียน */
export async function readQueue(): Promise<QueuedWrite[]> {
  const db = await openLocalDatabase()
  const writes = await waitFor(db.transaction(QUEUE).objectStore(QUEUE).getAll())
  return writes as QueuedWrite[]
}

/** เอาคำสั่งออกจากคิว (ส่งสำเร็จแล้ว) */
export async function removeFromQueue(key: number) {
  const db = await openLocalDatabase()
  await waitFor(db.transaction(QUEUE, 'readwrite').objectStore(QUEUE).delete(key))
}

/** ล้างข้อมูลในเครื่องทั้งหมด (ใช้ตอนออกจากระบบ) */
export async function clearLocalStore() {
  const db = await openLocalDatabase()
  await waitFor(db.transaction(SNAPSHOTS, 'readwrite').objectStore(SNAPSHOTS).clear())
  await waitFor(db.transaction(QUEUE, 'readwrite').objectStore(QUEUE).clear())
}

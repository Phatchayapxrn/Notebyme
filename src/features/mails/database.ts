// =====================================================================
// database.ts (mails) : อ่าน / เพิ่ม / แก้ / ลบ ชุดเมล (ตาราง mail_sets)
// ใช้ชั้นออฟไลน์ (offlineData) → ใช้ได้ตอนไม่มีเน็ต แล้วซิงค์ทีหลัง
// =====================================================================
import { deleteRow, insertRow, listRows, updateRow } from '@/shared/offline/offlineData'
import type { Row } from '@/shared/offline/localStore'
import type { TrashItem } from '../AppFeature'
import { DEFAULT_FIELD_COUNT, type MailField, type MailSet } from './types'

export const MAILS_TABLE = 'mail_sets'

function rowToMailSet(row: Row): MailSet {
  return {
    id: row.id,
    title: (row.title as string) ?? '',
    fields: (row.fields as MailField[]) ?? [],
    orderNumber: (row.order_number as number) ?? 0,
    createdAt: row.created_at as string,
  }
}

/** เรียงตามลำดับ แล้วตามเวลาสร้าง */
function sortSets(first: MailSet, second: MailSet) {
  return first.orderNumber - second.orderNumber || first.createdAt.localeCompare(second.createdAt)
}

/** ดึงชุดเมลทั้งหมด (ที่ไม่อยู่ในถังขยะ) */
export async function getAllMailSets(): Promise<MailSet[]> {
  const rows = await listRows(MAILS_TABLE)
  return rows
    .filter((row) => !row.deleted_at)
    .map(rowToMailSet)
    .sort(sortSets)
}

/** เพิ่มชุดใหม่ (ช่องว่าง DEFAULT_FIELD_COUNT ช่อง) คืน id ของชุดที่เพิ่ม */
export async function addMailSet(orderNumber: number): Promise<string> {
  const fields: MailField[] = Array.from({ length: DEFAULT_FIELD_COUNT }, () => ({ label: '', value: '' }))
  return insertRow(MAILS_TABLE, { title: '', fields, order_number: orderNumber })
}

/** แก้ชื่อ / ช่องข้อมูลของชุด */
export async function saveMailSet(setId: string, changes: { title: string; fields: MailField[] }) {
  await updateRow(MAILS_TABLE, setId, { title: changes.title, fields: changes.fields })
}

/** ย้ายไปถังขยะ */
export async function moveMailSetToTrash(setId: string) {
  await updateRow(MAILS_TABLE, setId, { deleted_at: new Date().toISOString() })
}

// ---------------------------------------------------------------------
// ถังขยะ + สำรองข้อมูล
// ---------------------------------------------------------------------

export async function getMailTrashItems(): Promise<TrashItem[]> {
  const rows = await listRows(MAILS_TABLE)
  return rows
    .filter((row) => row.deleted_at)
    .sort((first, second) => String(second.deleted_at).localeCompare(String(first.deleted_at)))
    .map((row) => {
      const set = rowToMailSet(row)
      return {
        id: set.id,
        title: set.title || 'ชุดเมลไม่มีชื่อ',
        // ไม่โชว์ค่าจริงในถังขยะ (มีรหัสผ่าน) บอกแค่จำนวนช่อง
        previewText: `${set.fields.length} ช่องข้อมูล`,
        deletedAt: row.deleted_at as string,
      }
    })
}

export async function bringMailSetBack(setId: string) {
  await updateRow(MAILS_TABLE, setId, { deleted_at: null })
}

export async function deleteMailSetForever(setId: string) {
  await deleteRow(MAILS_TABLE, setId)
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllMailSetsForBackup() {
  return listRows(MAILS_TABLE)
}

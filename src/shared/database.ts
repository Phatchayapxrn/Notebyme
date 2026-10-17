// =====================================================================
// database.ts : เชื่อมต่อกับ Supabase (ฐานข้อมูล + ล็อกอิน + ที่เก็บไฟล์)
// ทุกไฟล์ที่ต้องอ่าน/เขียนข้อมูล ให้ import { database } จากไฟล์นี้
// =====================================================================
import { createClient } from '@supabase/supabase-js'

// ตัด /rest/v1/ ท้ายลิงก์ออกให้ (เผื่อคัดลอกลิงก์ยาวมาจากหน้า API ของ Supabase)
const databaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(new RegExp('/rest/v1/?$'), '').replace(new RegExp('/$'), '')
const databaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true = ใส่ค่าในไฟล์ .env ครบแล้ว พร้อมใช้งาน */
export const isDatabaseReady = Boolean(databaseUrl && databaseKey && !databaseUrl.includes('xxxxxxxx'))

/** ตัวเชื่อมต่อฐานข้อมูล ใช้ทั้งเว็บ */
export const database = createClient(
  databaseUrl || 'http://localhost:54321',
  databaseKey || 'missing-key',
  {
    auth: {
      persistSession: true, // จำการล็อกอินไว้ ไม่ต้องล็อกอินใหม่ทุกครั้ง
      autoRefreshToken: true,
    },
  },
)

/** ดึง id ของผู้ใช้ที่ล็อกอินอยู่ (ถ้าไม่ได้ล็อกอิน จะ error) */
export async function getMyUserId(): Promise<string> {
  const { data } = await database.auth.getSession()
  const userId = data.session?.user.id
  if (!userId) throw new Error('ยังไม่ได้ล็อกอิน')
  return userId
}

/**
 * บอกทุกหน้าที่แสดงรายการจากตารางนี้ ให้โหลดข้อมูลใหม่
 * (เรียกหลังจากเพิ่ม/แก้/ลบข้อมูล หน้าจอจะอัปเดตทันทีโดยไม่ต้องรอ realtime)
 */
export function tellListChanged(tableName: string) {
  window.dispatchEvent(new CustomEvent('list-changed', { detail: tableName }))
}

/** ถ้า Supabase ส่ง error กลับมา ให้โยน error ออกไป (หน้าจอจะได้แสดงข้อความ) */
export function stopIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

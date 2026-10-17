// =====================================================================
// loginActions.ts : ล็อกอิน / สมัคร / ออกจากระบบ (ผ่าน Supabase Auth)
// =====================================================================
import { database } from '@/shared/database'

/** แปลงข้อความ error ภาษาอังกฤษจาก Supabase เป็นภาษาไทยที่เข้าใจง่าย */
function toThaiError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (message.includes('Email not confirmed')) return 'ยังไม่ได้ยืนยันอีเมล ลองเช็คกล่องจดหมายดูนะ'
  if (message.includes('User already registered')) return 'อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน'
  if (message.includes('Password should be at least')) return 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัว'
  if (message.includes('valid email') || message.includes('invalid format')) return 'รูปแบบอีเมลไม่ถูกต้อง'
  if (message.includes('rate limit')) return 'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่'
  if (message.includes('Failed to fetch')) return 'เชื่อมต่อไม่ได้ เช็คอินเทอร์เน็ตดูนะ'
  return message
}

/** เข้าสู่ระบบด้วยอีเมล + รหัสผ่าน */
export async function logIn(email: string, password: string) {
  const { error } = await database.auth.signInWithPassword({ email, password })
  if (error) throw new Error(toThaiError(error.message))
}

/**
 * สมัครใหม่
 * คืนค่า true = ต้องไปยืนยันอีเมลก่อน (ถ้าเปิดตั้งค่า "Confirm email" ไว้ใน Supabase)
 */
export async function signUp(email: string, password: string): Promise<boolean> {
  const { data, error } = await database.auth.signUp({ email, password })
  if (error) throw new Error(toThaiError(error.message))
  return !data.session
}

/** ออกจากระบบ */
export async function logOut() {
  await database.auth.signOut()
}

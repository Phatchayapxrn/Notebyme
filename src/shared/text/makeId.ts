// =====================================================================
// makeId.ts : สร้าง id แบบสุ่ม (รูปแบบ uuid)
//
// ทำไมไม่เรียก crypto.randomUUID() ตรงๆ:
//   ฟังก์ชันนั้นมีเฉพาะหน้าเว็บที่เป็น https หรือ localhost
//   เปิดผ่าน IP ในวงเน็ตบ้าน (http://192.168.x.x) บนมือถือ จะไม่มี → แอพพัง
// =====================================================================
export function makeId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  // ตัวสำรอง: สุ่มจาก crypto.getRandomValues (ใช้ได้ทุกที่) แล้วจัดเป็นรูป uuid เวอร์ชัน 4
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

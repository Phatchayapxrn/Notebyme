// =====================================================================
// groupTypes.ts : หน้าตาข้อมูลของ "หมวดหมู่"
// หมวดหมู่ใช้ร่วมกันทั้ง โน๊ต และ สิ่งที่ต้องทำ (และระบบอื่นในอนาคต)
// =====================================================================

export interface Group {
  id: string
  name: string
  emoji: string
  /** สีประจำหมวด เช่น '#F2BFC8' */
  color: string
  /** ภาพปก: 'pattern:hearts' (ลายสำเร็จรูป) หรือ path ไฟล์ที่อัปโหลดเอง */
  coverPicture: string
  orderNumber: number
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนสร้าง/แก้ไขหมวด */
export type GroupInput = Pick<Group, 'name' | 'emoji' | 'color' | 'coverPicture'>

/** ลายปกสำเร็จรูป (ไฟล์อยู่ใน public/patterns/) */
export const COVER_PATTERNS = [
  { id: 'pattern:hearts', name: 'หัวใจ' },
  { id: 'pattern:plaid', name: 'ลายสก็อต' },
  { id: 'pattern:dots', name: 'จุด' },
  { id: 'pattern:diamonds', name: 'ข้าวหลามตัด' },
  { id: 'pattern:stripes', name: 'ทางเฉียง' },
  { id: 'pattern:flowers', name: 'ดอกไม้' },
] as const

/** สีให้เลือกตอนสร้างหมวด */
export const GROUP_COLORS = ['#F2BFC8', '#D98A9A', '#E9C9A8', '#C9B6D9', '#B8D4C8', '#A9C5E0', '#8C5A66', '#3B1E24']

/** อีโมจิแนะนำตอนสร้างหมวด */
export const SUGGESTED_EMOJIS = ['✨', '💡', '📚', '🎨', '💖', '🎬', '🍰', '✈️', '💼', '🏠', '🎵', '🌸', '📝', '🧸', '🌙', '🛍️']

/** true = ภาพปกเป็นลายสำเร็จรูป, false = รูปที่อัปโหลดเอง */
export function isPatternCover(coverPicture: string) {
  return coverPicture.startsWith('pattern:')
}

/** แปลง 'pattern:hearts' → '/patterns/hearts.svg' */
export function getPatternLink(coverPicture: string) {
  return `/patterns/${coverPicture.replace('pattern:', '')}.svg`
}

// =====================================================================
// types.ts : หน้าตาข้อมูลของ "สิ่งที่ต้องทำ"
// =====================================================================

/** ความสำคัญ: low = ต่ำ, medium = กลาง, high = สูง */
export type Importance = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  text: string
  isDone: boolean
  importance: Importance
  /** วันที่ต้องเสร็จ แบบ "YYYY-MM-DD" (null = ไม่กำหนด) */
  dueDate: string | null
  /** อยู่หมวดไหน (null = ไม่มีหมวด) */
  groupId: string | null
  createdAt: string
  /** เวลาที่ติ๊กเสร็จ */
  doneAt: string | null
}

/** ข้อมูลที่ใช้ตอนเพิ่มงานใหม่ */
export type NewTask = Pick<Task, 'text' | 'importance' | 'dueDate' | 'groupId'>

/** ชื่อภาษาไทยของแต่ละระดับ + สี */
export const IMPORTANCE_INFO: Record<Importance, { name: string; badgeClass: string }> = {
  low: { name: 'ต่ำ', badgeClass: 'bg-cream text-soft border border-line' },
  medium: { name: 'กลาง', badgeClass: 'bg-blush text-wine' },
  high: { name: 'สูง', badgeClass: 'bg-rose/25 text-danger' },
}

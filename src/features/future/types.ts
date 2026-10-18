// =====================================================================
// types.ts : หน้าตาข้อมูลของ "ข้อความถึงตัวเองในอนาคต"
// =====================================================================

export interface FutureMessage {
  id: string
  /** ข้อความ */
  text: string
  /** วันที่จะเปิดให้อ่าน แบบ "YYYY-MM-DD" */
  showDate: string
  /** อ่านแล้วหรือยัง (อ่านแล้วจะไม่ขึ้นในหน้าแรกอีก) */
  isRead: boolean
  /** วันที่เขียน */
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนเขียนข้อความใหม่ / แก้ไข */
export type NewFutureMessage = Pick<FutureMessage, 'text' | 'showDate'>
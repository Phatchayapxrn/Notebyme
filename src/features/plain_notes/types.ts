// =====================================================================
// types.ts (plain_notes) : หน้าตาข้อมูลของระบบ "โน๊ตทั่วไป"
// =====================================================================

/** โน๊ตทั่วไป 1 อัน */
export interface PlainNote {
  id: string
  text: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

/** ชื่อโน๊ต = บรรทัดแรกที่ไม่ว่าง */
export function getNoteTitle(note: PlainNote): string {
  const firstLine = note.text.split('\n').find((line) => line.trim())
  return firstLine?.trim().slice(0, 80) || 'โน๊ตใหม่'
}

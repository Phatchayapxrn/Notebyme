// =====================================================================
// types.ts (memo) : หน้าตาข้อมูลของระบบ "โน๊ต" (แบบโน๊ตไอโฟน)
// =====================================================================
import type { JSONContent } from '@tiptap/react'

/** โฟลเดอร์ 1 อัน */
export interface MemoFolder {
  id: string
  name: string
  emoji: string
  orderNumber: number
}

/** โน๊ต 1 อัน */
export interface Memo {
  id: string
  /** อยู่โฟลเดอร์ไหน (null = ไม่จัดหมวด) */
  folderId: string | null
  content: JSONContent | null
  /** ข้อความล้วน ใช้ค้นหา + โชว์ตัวอย่าง */
  plainText: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

/** ส่วนที่บันทึกอัตโนมัติตอนพิมพ์ */
export interface MemoContent {
  content: JSONContent | null
  plainText: string
}

/** ชื่อโน๊ต = บรรทัดแรกที่ไม่ว่าง */
export function getMemoTitle(memo: Pick<Memo, 'plainText'>): string {
  const firstLine = memo.plainText.split('\n').find((line) => line.trim())
  return firstLine?.trim().slice(0, 80) || 'โน๊ตใหม่'
}

/** ตัวอย่างข้อความใต้ชื่อ = บรรทัดถัดไป (ต่อกันเป็นบรรทัดเดียว) */
export function getMemoPreview(memo: Pick<Memo, 'plainText'>): string {
  const lines = memo.plainText.split('\n').filter((line) => line.trim())
  return lines.slice(1).join(' ').slice(0, 120)
}

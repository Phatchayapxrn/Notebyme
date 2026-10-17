// =====================================================================
// types.ts : หน้าตาข้อมูลของ "โน๊ต / ไอเดีย"
// =====================================================================
import type { JSONContent } from '@tiptap/react'

/** โน๊ตแบบย่อ (ใช้ในหน้ารายการ ไม่มีเนื้อหาเต็ม จะได้โหลดเร็ว) */
export interface NoteSummary {
  id: string
  title: string
  /** เนื้อหาแบบตัวหนังสือล้วน (ใช้ค้นหา + โชว์ตัวอย่าง) */
  plainText: string
  /** อยู่หมวดไหน (null = ไม่มีหมวด) */
  groupId: string | null
  isPinned: boolean
  /** path รูปแรกในโน๊ต ใช้ทำรูปย่อ (null = ไม่มีรูป) */
  firstPicture: string | null
  createdAt: string
  updatedAt: string
}

/** โน๊ตแบบเต็ม (ใช้ในหน้าแก้ไข) */
export interface Note extends NoteSummary {
  /** เนื้อหาเต็ม รูปแบบ JSON ของ TipTap editor */
  content: JSONContent | null
}

/** ข้อมูลที่บันทึกตอนแก้ไขโน๊ต */
export interface NoteChanges {
  title: string
  content: JSONContent | null
  plainText: string
  firstPicture: string | null
  groupId: string | null
  isPinned: boolean
}

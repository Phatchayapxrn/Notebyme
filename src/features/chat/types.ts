// =====================================================================
// types.ts (chat) : หน้าตาข้อมูลของระบบ "แชท"
// =====================================================================

/** ไฟล์แนบ 1 ไฟล์ (รูป หรือ วิดีโอ) */
export interface ChatAttachment {
  path: string
  type: string
  width?: number
  height?: number
}

/** ห้องแชท */
export interface ChatRoom {
  id: string
  name: string
  createdAt: string
  /** เวลาที่มีข้อความล่าสุด (ใช้เรียงห้อง) */
  lastTime: string
  /** ข้อความล่าสุดแบบสั้น (โชว์ใต้ชื่อห้อง) */
  lastText: string
}

/** ข้อความ 1 ข้อความ */
export interface ChatMessage {
  id: string
  roomId: string
  text: string
  attachments: ChatAttachment[]
  isPinned: boolean
  createdAt: string
  /** true = เคยแก้ไข */
  isEdited: boolean
}

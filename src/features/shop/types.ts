// =====================================================================
// types.ts : หน้าตาข้อมูลของ "ร้านค้า" (ชุดข้อความ / แคปชั่น)
// =====================================================================

/** ชุดข้อความ 1 ชุด (วางข้อความไว้ กดคัดลอกไปใช้ได้) */
export interface ShopMessage {
  id: string
  /** ชื่อชุด (ว่างได้) */
  title: string
  /** ข้อความทั้งชุด */
  text: string
  /** ลำดับการแสดง (เลขน้อยอยู่ก่อน) */
  orderNumber: number
  createdAt: string
}

/** สถานะแคปชั่น: draft = ร่าง, ready = พร้อมโพสต์, posted = โพสต์แล้ว */
export type CaptionStatus = 'draft' | 'ready' | 'posted'

/** แพลตฟอร์มที่โพสต์ได้ (color = สีป้าย) */
export const PLATFORM_LIST = [
  { id: 'fb', name: 'Facebook', shortName: 'FB', color: '#1877f2' },
  { id: 'ig', name: 'Instagram', shortName: 'IG', color: '#d62976' },
  { id: 'tiktok', name: 'TikTok', shortName: 'TikTok', color: '#0f9b9b' },
  { id: 'line', name: 'LINE', shortName: 'LINE', color: '#06a94d' },
]

/** ชื่อ + อีโมจิ + สี ของแต่ละสถานะแคปชั่น */
export const CAPTION_STATUS_INFO: Record<CaptionStatus, { name: string; emoji: string; badgeClass: string }> = {
  draft: { name: 'ร่าง', emoji: '✏️', badgeClass: 'bg-cream text-soft border border-line' },
  ready: { name: 'พร้อมโพสต์', emoji: '🟢', badgeClass: 'bg-blush text-ink' },
  posted: { name: 'โพสต์แล้ว', emoji: '✅', badgeClass: 'bg-cream text-soft border border-line' },
}

/** แคปชั่น 1 อัน */
export interface ShopCaption {
  id: string
  text: string
  /** วันที่จะโพสต์ "2026-11-08" (null = อยู่ในคลังสำรอง ยังไม่กำหนดวัน) */
  postDate: string | null
  /** เวลาที่จะโพสต์ "14:30" (null = ไม่ระบุ) */
  postTime: string | null
  status: CaptionStatus
  /** id ของแพลตฟอร์ม (ดู PLATFORM_LIST) */
  platforms: string[]
  /** true = เตือนตอนถึงเวลาโพสต์ */
  remind: boolean
  /** หมวดของแคปชั่น (id ของ groups ชนิด caption) null = ไม่มีหมวด */
  groupId: string | null
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนเพิ่ม/แก้แคปชั่น */
export type NewCaption = Pick<ShopCaption, 'text' | 'postDate' | 'postTime' | 'status' | 'platforms' | 'remind' | 'groupId'>

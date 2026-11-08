// =====================================================================
// types.ts : หน้าตาข้อมูลของ "ร้านค้า" (ชุดข้อความ / สินค้า / ออเดอร์)
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

/** สินค้า 1 อย่าง */
export interface Product {
  id: string
  name: string
  /** ราคาขาย (บาท) */
  price: number
  /** จำนวนที่เหลือ */
  stock: number
  /** หมายเหตุ เช่น สี / ไซซ์ */
  note: string
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนเพิ่ม/แก้สินค้า */
export type NewProduct = Pick<Product, 'name' | 'price' | 'stock' | 'note'>

/** สถานะออเดอร์: waiting = รอโอน, paid = โอนแล้ว รอส่ง, sent = ส่งแล้ว */
export type OrderStatus = 'waiting' | 'paid' | 'sent'

/** ออเดอร์ 1 รายการ */
export interface Order {
  id: string
  customerName: string
  /** รายละเอียด เช่น สินค้าที่สั่ง / ที่อยู่ */
  detail: string
  /** ยอดรวม (บาท) */
  totalPrice: number
  status: OrderStatus
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนเพิ่ม/แก้ออเดอร์ */
export type NewOrder = Pick<Order, 'customerName' | 'detail' | 'totalPrice' | 'status'>

/** ชื่อภาษาไทย + สี + สถานะถัดไป ของแต่ละสถานะออเดอร์ */
export const ORDER_STATUS_INFO: Record<OrderStatus, { name: string; emoji: string; badgeClass: string; nextStatus: OrderStatus }> = {
  waiting: { name: 'รอโอน', emoji: '⏳', badgeClass: 'bg-rose/15 text-rose', nextStatus: 'paid' },
  paid: { name: 'โอนแล้ว รอส่ง', emoji: '📦', badgeClass: 'bg-blush text-ink', nextStatus: 'sent' },
  sent: { name: 'ส่งแล้ว', emoji: '✅', badgeClass: 'bg-cream text-soft border border-line', nextStatus: 'waiting' },
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
  createdAt: string
}

/** ข้อมูลที่ใช้ตอนเพิ่ม/แก้แคปชั่น */
export type NewCaption = Pick<ShopCaption, 'text' | 'postDate' | 'postTime' | 'status' | 'platforms' | 'remind'>

/** เหลือเท่านี้หรือน้อยกว่า = "ใกล้หมด" */
export const LOW_STOCK_NUMBER = 3

/** แสดงเงิน เช่น 1250 → "฿1,250" */
export function showMoney(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', { maximumFractionDigits: 2 })}`
}

/** แปลงตัวหนังสือที่พิมพ์ → ตัวเลข (พิมพ์ผิด/ว่าง = 0, ลบลูกน้ำออกให้) */
export function toNumber(text: string): number {
  const number = Number(text.replace(/,/g, '').trim())
  return Number.isFinite(number) ? number : 0
}
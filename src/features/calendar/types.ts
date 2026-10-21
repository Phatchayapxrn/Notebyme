// =====================================================================
// types.ts (calendar) : หน้าตาข้อมูลของระบบ "ปฏิทิน"
// =====================================================================

export type RepeatKind = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

/** สีกิจกรรม (ชุดสีกราฟที่ตรวจแล้ว) — โชว์เป็นแถบสีด้านซ้ายของกิจกรรม ตัวหนังสือยังใช้สีปกติ */
export const EVENT_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'blue', name: 'น้ำเงิน', hex: '#2a78d6' },
  { id: 'orange', name: 'ส้ม', hex: '#eb6834' },
  { id: 'aqua', name: 'เขียวมิ้นต์', hex: '#1baf7a' },
  { id: 'pink', name: 'ชมพู', hex: '#e87ba4' },
  { id: 'violet', name: 'ม่วง', hex: '#6250d6' },
  { id: 'yellow', name: 'เหลือง', hex: '#eda100' },
]

/** หา hex ของสี (ไม่รู้จัก = น้ำเงิน) */
export function colorHex(colorId: string): string {
  return (EVENT_COLORS.find((color) => color.id === colorId) ?? EVENT_COLORS[0]).hex
}

export const REPEAT_LIST: { id: RepeatKind; name: string }[] = [
  { id: 'none', name: 'ไม่ซ้ำ' },
  { id: 'daily', name: 'ทุกวัน' },
  { id: 'weekly', name: 'ทุกสัปดาห์' },
  { id: 'monthly', name: 'ทุกเดือน' },
  { id: 'yearly', name: 'ทุกปี' },
]

/** ตัวเลือกเตือนล่วงหน้า (null = ไม่เตือน) */
export const REMIND_LIST: { minutes: number | null; name: string }[] = [
  { minutes: null, name: 'ไม่เตือน' },
  { minutes: 0, name: 'ตอนเริ่ม' },
  { minutes: 10, name: 'ก่อน 10 นาที' },
  { minutes: 30, name: 'ก่อน 30 นาที' },
  { minutes: 60, name: 'ก่อน 1 ชั่วโมง' },
  { minutes: 1440, name: 'ก่อน 1 วัน' },
]

/** กิจกรรม 1 อัน */
export interface CalEvent {
  id: string
  title: string
  note: string
  /** วันที่ (กิจกรรมที่ซ้ำ = วันแรก) "2026-10-21" */
  eventDate: string
  isAllDay: boolean
  /** "14:30" (ทั้งวัน = null) */
  startTime: string | null
  endTime: string | null
  color: string
  repeatKind: RepeatKind
  /** ซ้ำถึงวันที่ (null = ไม่สิ้นสุด) */
  repeatUntil: string | null
  remindMinutes: number | null
}

/** ข้อมูลที่กรอกในฟอร์ม */
export type EventForm = Omit<CalEvent, 'id'>

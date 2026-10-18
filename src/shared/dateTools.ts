// =====================================================================
// dateTools.ts : ตัวช่วยเรื่องวันที่ (แสดงเป็นภาษาไทย)
// =====================================================================

/** วันที่แบบสั้น เช่น "17 ต.ค." (ถ้าเป็นวันนี้ จะโชว์เวลา เช่น "14:30") */
export function showShortDate(dateText: string): string {
  const date = new Date(dateText)
  if (isToday(date)) {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }
  const isThisYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: isThisYear ? undefined : '2-digit' })
}

/** วันที่แบบเต็ม เช่น "วันศุกร์ที่ 17 ตุลาคม" */
export function showLongDate(date: Date = new Date()): string {
  const dayName = date.toLocaleDateString('th-TH', { weekday: 'long' })
  const dayAndMonth = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })
  return `${dayName}ที่ ${dayAndMonth}`
}

/** true = วันเดียวกับวันนี้ */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
  )
}

/** วันนี้ในรูปแบบ "2026-10-17" (แบบที่ฐานข้อมูลใช้กับคอลัมน์ date) */
export function todayAsText(): string {
  return toDateText(new Date())
}

/** เปลี่ยน Date เป็น "YYYY-MM-DD" ตามเวลาเครื่อง */
export function toDateText(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** นับว่าอีกกี่วันจะถึงวันนั้น (ติดลบ = เลยมาแล้ว) จาก "YYYY-MM-DD" */
export function daysUntil(dateText: string): number {
  const [year, month, day] = dateText.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** ข้อความบอกกำหนดส่ง เช่น "วันนี้", "พรุ่งนี้", "อีก 3 วัน", "เลยมา 2 วัน" */
export function showDueText(dateText: string): string {
  const days = daysUntil(dateText)
  if (days === 0) return 'วันนี้'
  if (days === 1) return 'พรุ่งนี้'
  if (days === -1) return 'เมื่อวาน'
  if (days < 0) return `เลยมา ${-days} วัน`
  if (days <= 7) return `อีก ${days} วัน`
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

/** วันที่ถัดไปจากวันนี้ เป็น "YYYY-MM-DD" เช่น dateFromToday({ months: 1 }) = อีก 1 เดือน */
export function dateFromToday({ days = 0, months = 0, years = 0 }: { days?: number; months?: number; years?: number }): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + years, date.getMonth() + months, date.getDate() + days)
  return toDateText(date)
}

/** วันที่แบบเต็มจาก "YYYY-MM-DD" เช่น "18 ตุลาคม 2569" */
export function showFullDate(dateText: string): string {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}
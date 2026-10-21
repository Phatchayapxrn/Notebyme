// =====================================================================
// calendarTools.ts : ตัวช่วยคำนวณวันที่ของปฏิทิน (ไม่ใช้ไลบรารีเพิ่ม)
// วันที่ทุกตัวเป็นข้อความ "YYYY-MM-DD" (เวลาเครื่อง) สัปดาห์เริ่มวันอาทิตย์
// =====================================================================
import { toDateText } from '@/shared/dateTools'
import type { CalEvent } from './types'

/** "2026-10-21" → Date (เที่ยงคืนตามเวลาเครื่อง) */
export function parseDate(dateText: string): Date {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** บวก/ลบจำนวนวัน */
export function addDays(dateText: string, count: number): string {
  const date = parseDate(dateText)
  date.setDate(date.getDate() + count)
  return toDateText(date)
}

/** วันอาทิตย์ของสัปดาห์ที่มีวันนั้น */
export function startOfWeek(dateText: string): string {
  return addDays(dateText, -parseDate(dateText).getDay())
}

/** วันที่ 1 ของเดือนของวันนั้น */
export function startOfMonth(dateText: string): string {
  return `${dateText.slice(0, 7)}-01`
}

/** เลื่อนไปกี่เดือน (วันที่ 1 ของเดือนใหม่) */
export function addMonths(dateText: string, count: number): string {
  const date = parseDate(startOfMonth(dateText))
  date.setMonth(date.getMonth() + count)
  return toDateText(date)
}

/** ตารางเดือน 6 สัปดาห์ (42 วัน) เริ่มจากวันอาทิตย์ของสัปดาห์ที่มีวันที่ 1 */
export function monthGrid(dateText: string): string[] {
  const first = startOfWeek(startOfMonth(dateText))
  return Array.from({ length: 42 }, (_, index) => addDays(first, index))
}

/** 7 วันของสัปดาห์ที่มีวันนั้น */
export function weekDays(dateText: string): string[] {
  const first = startOfWeek(dateText)
  return Array.from({ length: 7 }, (_, index) => addDays(first, index))
}

/** จำนวนวันระหว่างสองวัน (second - first) */
function daysBetween(first: string, second: string): number {
  const toUtc = (dateText: string) => {
    const [year, month, day] = dateText.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtc(second) - toUtc(first)) / 86400000)
}

/** จำนวนวันในเดือนของวันที่นั้น */
function lastDayOfMonth(dateText: string): number {
  const date = parseDate(dateText)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/** กิจกรรมนี้เกิดขึ้นในวันนั้นไหม (รวมกิจกรรมที่ตั้งให้ซ้ำ) */
export function occursOn(event: CalEvent, dateText: string): boolean {
  if (dateText < event.eventDate) return false
  if (event.repeatUntil && dateText > event.repeatUntil) return false

  const startDay = Number(event.eventDate.slice(8, 10))
  const day = Number(dateText.slice(8, 10))
  switch (event.repeatKind) {
    case 'none':
      return dateText === event.eventDate
    case 'daily':
      return true
    case 'weekly':
      return daysBetween(event.eventDate, dateText) % 7 === 0
    case 'monthly':
      // วันที่ 31 ในเดือนที่มี 30 วัน → ไปตกวันสุดท้ายของเดือนแทน
      return day === Math.min(startDay, lastDayOfMonth(dateText))
    case 'yearly':
      return event.eventDate.slice(5, 7) === dateText.slice(5, 7) && day === Math.min(startDay, lastDayOfMonth(dateText))
  }
}

/** เวลา "14:30" → จำนวนนาทีตั้งแต่เที่ยงคืน */
export function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

/** กิจกรรมทั้งหมดของวันนั้น (ทั้งวันก่อน แล้วเรียงตามเวลา) */
export function eventsOn(events: CalEvent[], dateText: string): CalEvent[] {
  return events
    .filter((event) => occursOn(event, dateText))
    .sort((first, second) => {
      if (first.isAllDay !== second.isAllDay) return first.isAllDay ? -1 : 1
      return toMinutes(first.startTime ?? '00:00') - toMinutes(second.startTime ?? '00:00') || first.title.localeCompare(second.title)
    })
}

/** ข้อความช่วงเวลาของกิจกรรม เช่น "14:30 – 15:30" / "ทั้งวัน" */
export function showEventTime(event: CalEvent): string {
  if (event.isAllDay || !event.startTime) return 'ทั้งวัน'
  return event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime
}

/** จัดกิจกรรมที่ทับเวลากันให้อยู่คนละคอลัมน์ (ใช้กับมุมมองวัน) */
export function layoutTimedEvents(events: CalEvent[]): { event: CalEvent; column: number; columnCount: number; start: number; end: number }[] {
  const timed = events
    .filter((event) => !event.isAllDay && event.startTime)
    .map((event) => {
      const start = toMinutes(event.startTime!)
      // ไม่มีเวลาจบ / จบก่อนเริ่ม = 1 ชั่วโมง
      const end = event.endTime && toMinutes(event.endTime) > start ? toMinutes(event.endTime) : Math.min(start + 60, 24 * 60)
      return { event, start, end, column: 0, columnCount: 1 }
    })
    .sort((first, second) => first.start - second.start || first.end - second.end)

  // แบ่งเป็นกลุ่มที่ทับกัน แล้วแจกคอลัมน์ในแต่ละกลุ่ม
  let cluster: typeof timed = []
  let clusterEnd = -1
  const finishCluster = () => {
    const columnCount = Math.max(1, ...cluster.map((item) => item.column + 1))
    cluster.forEach((item) => (item.columnCount = columnCount))
    cluster = []
  }
  for (const item of timed) {
    if (cluster.length > 0 && item.start >= clusterEnd) finishCluster()
    const usedColumns = new Set(cluster.filter((other) => other.end > item.start).map((other) => other.column))
    while (usedColumns.has(item.column)) item.column++
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  finishCluster()
  return timed
}

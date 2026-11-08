// =====================================================================
// groupByTime.ts : จัดโน๊ตเป็นกลุ่มตามเวลาแก้ล่าสุด (เหมือนโน๊ตไอโฟน)
//   วันนี้ → 7 วันที่ผ่านมา → 30 วันที่ผ่านมา → แยกตามเดือน
// =====================================================================
import type { Memo } from './types'

export interface MemoGroup {
  /** หัวข้อกลุ่ม เช่น "วันนี้" */
  title: string
  memos: Memo[]
}

const DAY = 24 * 60 * 60 * 1000

/** เที่ยงคืนของวันนี้ (เวลาในเครื่อง) */
function startOfToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

/** ชื่อกลุ่มของโน๊ตที่แก้เมื่อเวลานี้ */
function getGroupTitle(updatedAt: string, today: number): string {
  const time = new Date(updatedAt).getTime()
  if (time >= today) return 'วันนี้'
  if (time >= today - 7 * DAY) return '7 วันที่ผ่านมา'
  if (time >= today - 30 * DAY) return '30 วันที่ผ่านมา'
  const date = new Date(updatedAt)
  const isThisYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('th-TH', isThisYear ? { month: 'long' } : { month: 'long', year: 'numeric' })
}

/** จัดกลุ่ม (รับโน๊ตที่เรียงใหม่สุดก่อนอยู่แล้ว) ลำดับกลุ่มเรียงตามเวลาเอง */
export function groupByTime(memos: Memo[]): MemoGroup[] {
  const today = startOfToday()
  const groups: MemoGroup[] = []
  for (const memo of memos) {
    const title = getGroupTitle(memo.updatedAt, today)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.title === title) lastGroup.memos.push(memo)
    else groups.push({ title, memos: [memo] })
  }
  return groups
}

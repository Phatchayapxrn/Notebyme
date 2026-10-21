// =====================================================================
// EventChip : แถบกิจกรรมเล็กๆ (ใช้ในมุมมองเดือน / สัปดาห์)
// แถบสีด้านซ้าย = สีของกิจกรรม ส่วนพื้นและตัวหนังสือใช้สีปกติ (อ่านง่ายทั้งโหมดสว่าง/มืด)
// =====================================================================
import { colorHex, type CalEvent } from '../types'

interface EventChipProps {
  event: CalEvent
  /** true = โชว์เวลาหน้าชื่อ */
  showTime?: boolean
  onClick: () => void
}

export function EventChip({ event, showTime = false, onClick }: EventChipProps) {
  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation() // ไม่ให้ไปกดโดนช่องวันที่ข้างหลัง
        onClick()
      }}
      className="flex w-full items-center gap-1 truncate rounded-md border-l-[3px] bg-blush px-1.5 py-0.5 text-left text-xs text-ink transition hover:bg-pink/50"
      style={{ borderLeftColor: colorHex(event.color) }}
      title={event.title}
    >
      {showTime && !event.isAllDay && event.startTime && <span className="flex-none font-typewriter text-soft">{event.startTime}</span>}
      <span className="truncate">{event.title}</span>
    </button>
  )
}

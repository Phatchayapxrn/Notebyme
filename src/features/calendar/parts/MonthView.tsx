// =====================================================================
// MonthView : มุมมองเดือน (ตาราง 7 คอลัมน์)
//   - กดที่ช่องวัน → เปิดมุมมองวันนั้น
//   - กดที่กิจกรรม → แก้กิจกรรม
//   - ช่องละไม่เกิน MAX_SHOWN กิจกรรม ที่เหลือโชว์ "+N" (มือถือ: โชว์จุดสีแทนชื่อ)
// =====================================================================
import { isToday } from '@/shared/dateTools'
import { eventsOn, monthGrid, parseDate } from '../calendarTools'
import { colorHex, type CalEvent } from '../types'
import { EventChip } from './EventChip'

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MAX_SHOWN = 3

interface MonthViewProps {
  /** วันที่ใดก็ได้ในเดือนที่จะแสดง */
  date: string
  events: CalEvent[]
  onOpenDay: (date: string) => void
  onEdit: (event: CalEvent) => void
}

export function MonthView({ date, events, onOpenDay, onEdit }: MonthViewProps) {
  const days = monthGrid(date)
  const thisMonth = date.slice(0, 7)

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-paper">
      <div className="grid grid-cols-7 border-b border-line">
        {DAY_NAMES.map((name) => (
          <div key={name} className="py-2 text-center text-xs font-medium text-soft">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = eventsOn(events, day)
          const isOtherMonth = day.slice(0, 7) !== thisMonth
          const isNow = isToday(parseDate(day))
          return (
            <div
              key={day}
              role="button"
              tabIndex={0}
              aria-label={`เปิดวันที่ ${Number(day.slice(8, 10))} มี ${dayEvents.length} กิจกรรม`}
              onClick={() => onOpenDay(day)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenDay(day)
                }
              }}
              className={`min-h-[4.5rem] cursor-pointer border-line p-1 text-left transition hover:bg-blush/50 sm:min-h-[6.5rem] ${index % 7 !== 6 ? 'border-r' : ''} ${index < 35 ? 'border-b' : ''} ${isOtherMonth ? 'bg-cream/60' : ''}`}
            >
              <span
                className={`mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full text-xs sm:mx-0 ${isNow ? 'bg-wine font-semibold text-paper' : isOtherMonth ? 'text-soft/60' : 'text-ink'}`}
              >
                {Number(day.slice(8, 10))}
              </span>

              {/* คอม: แถบกิจกรรม */}
              <div className="hidden flex-col gap-0.5 sm:flex">
                {dayEvents.slice(0, MAX_SHOWN).map((event) => (
                  <EventChip key={event.id} event={event} showTime onClick={() => onEdit(event)} />
                ))}
                {dayEvents.length > MAX_SHOWN && <span className="px-1 text-xs text-soft">+{dayEvents.length - MAX_SHOWN} อีก</span>}
              </div>

              {/* มือถือ: จุดสี (ช่องแคบ ไม่มีที่ให้ชื่อ) */}
              <div className="flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden="true">
                {dayEvents.slice(0, 4).map((event) => (
                  <span key={event.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colorHex(event.color) }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

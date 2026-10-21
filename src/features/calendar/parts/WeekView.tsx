// =====================================================================
// WeekView : มุมมองสัปดาห์ — 7 วันเรียงลงมา แต่ละวันมีรายการกิจกรรมตามเวลา
// (เหมาะกับมือถือ: อ่านง่าย ไม่ต้องเลื่อนซ้ายขวา)
// =====================================================================
import { Plus } from 'lucide-react'
import { isToday, showLongDate } from '@/shared/dateTools'
import { IconButton } from '@/shared/parts/RoundButton'
import { eventsOn, parseDate, showEventTime, weekDays } from '../calendarTools'
import { colorHex, type CalEvent } from '../types'

interface WeekViewProps {
  date: string
  events: CalEvent[]
  onOpenDay: (date: string) => void
  onEdit: (event: CalEvent) => void
  onAdd: (date: string) => void
}

export function WeekView({ date, events, onOpenDay, onEdit, onAdd }: WeekViewProps) {
  return (
    <div className="flex flex-col gap-3">
      {weekDays(date).map((day) => {
        const dayEvents = eventsOn(events, day)
        const isNow = isToday(parseDate(day))
        return (
          <section key={day} className={`rounded-3xl border bg-paper p-3 ${isNow ? 'border-wine' : 'border-line'}`}>
            <header className="mb-2 flex items-center justify-between">
              <button type="button" onClick={() => onOpenDay(day)} className={`text-sm font-semibold hover:underline ${isNow ? 'text-wine' : 'text-ink'}`}>
                {showLongDate(parseDate(day))}
                {isNow && <span className="ml-2 rounded-full bg-wine px-2 py-0.5 text-xs font-normal text-paper">วันนี้</span>}
              </button>
              <IconButton label={`เพิ่มกิจกรรมวันที่ ${Number(day.slice(8, 10))}`} onClick={() => onAdd(day)} className="h-8 w-8">
                <Plus size={16} />
              </IconButton>
            </header>
            {dayEvents.length === 0 && <p className="text-sm text-soft/70">ว่าง</p>}
            <ul className="flex flex-col gap-1.5">
              {dayEvents.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    className="flex w-full items-center gap-3 rounded-xl border-l-4 bg-blush px-3 py-2 text-left transition hover:bg-pink/50"
                    style={{ borderLeftColor: colorHex(event.color) }}
                  >
                    <span className="w-24 flex-none font-typewriter text-xs text-soft">{showEventTime(event)}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{event.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

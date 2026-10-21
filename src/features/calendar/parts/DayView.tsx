// =====================================================================
// DayView : มุมมองวัน — แถบ "ทั้งวัน" ด้านบน + ตารางเวลาทีละชั่วโมง
//   - กดช่องว่างในตารางเวลา → เพิ่มกิจกรรมที่ชั่วโมงนั้น
//   - กิจกรรมที่เวลาทับกัน จะแบ่งเป็นคอลัมน์ข้างกัน
// =====================================================================
import { useEffect, useRef } from 'react'
import { eventsOn, layoutTimedEvents, showEventTime } from '../calendarTools'
import { colorHex, type CalEvent } from '../types'
import { EventChip } from './EventChip'

/** ความสูงของ 1 ชั่วโมง (px) */
const HOUR_HEIGHT = 52

interface DayViewProps {
  date: string
  events: CalEvent[]
  onEdit: (event: CalEvent) => void
  /** เพิ่มกิจกรรม (time = "14:00" ถ้ากดช่องเวลา / ไม่ใส่ = ทั้งวัน) */
  onAdd: (date: string, time?: string) => void
}

export function DayView({ date, events, onEdit, onAdd }: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dayEvents = eventsOn(events, date)
  const allDayEvents = dayEvents.filter((event) => event.isAllDay || !event.startTime)
  const timedEvents = layoutTimedEvents(dayEvents)

  // เปิดมาให้เลื่อนไปที่ 7 โมงเช้า (หรือกิจกรรมแรกของวัน ถ้าเช้ากว่านั้น)
  useEffect(() => {
    const firstStart = timedEvents.length > 0 ? Math.min(...timedEvents.map((item) => item.start)) / 60 : 7
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, Math.min(7, firstStart) - 0.5) * HOUR_HEIGHT
    // เลื่อนครั้งเดียวต่อวันที่เปิด
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-paper">
      {/* ทั้งวัน */}
      <div className="flex flex-col gap-1 border-b border-line p-3">
        <p className="text-xs text-soft">ทั้งวัน</p>
        {allDayEvents.length === 0 && <p className="text-sm text-soft/70">ไม่มีกิจกรรมทั้งวัน</p>}
        {allDayEvents.map((event) => (
          <EventChip key={event.id} event={event} onClick={() => onEdit(event)} />
        ))}
      </div>

      {/* ตารางเวลา */}
      <div ref={scrollRef} className="max-h-[60dvh] overflow-y-auto">
        <div className="relative flex" style={{ height: HOUR_HEIGHT * 24 }}>
          <div className="w-14 flex-none">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="pr-2 text-right font-typewriter text-[11px] text-soft" style={{ height: HOUR_HEIGHT }}>
                {hour > 0 && `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          <div className="relative flex-1 border-l border-line">
            {Array.from({ length: 24 }, (_, hour) => (
              <button
                key={hour}
                type="button"
                aria-label={`เพิ่มกิจกรรมเวลา ${String(hour).padStart(2, '0')}:00`}
                onClick={() => onAdd(date, `${String(hour).padStart(2, '0')}:00`)}
                className="block w-full border-b border-line/70 transition hover:bg-blush/50"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {timedEvents.map(({ event, column, columnCount, start, end }) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onEdit(event)}
                className="absolute overflow-hidden rounded-lg border-l-4 bg-blush px-2 py-1 text-left text-xs text-ink shadow-sm transition hover:bg-pink/60"
                style={{
                  top: (start / 60) * HOUR_HEIGHT,
                  height: Math.max(((end - start) / 60) * HOUR_HEIGHT - 2, 22),
                  left: `calc(${(column / columnCount) * 100}% + 2px)`,
                  width: `calc(${100 / columnCount}% - 4px)`,
                  borderLeftColor: colorHex(event.color),
                }}
              >
                <span className="block truncate font-semibold">{event.title}</span>
                <span className="block truncate font-typewriter text-[11px] text-soft">{showEventTime(event)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

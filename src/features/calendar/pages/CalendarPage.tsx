// =====================================================================
// CalendarPage : หน้าปฏิทิน (/calendar) แบบ Google Calendar
//   มุมมอง เดือน / สัปดาห์ / วัน (จำไว้ในลิงก์ เช่น /calendar?view=week&date=2026-10-21)
//   ปุ่ม ‹ › เลื่อนไปก่อนหน้า/ถัดไป, "วันนี้" กลับมาวันปัจจุบัน
// =====================================================================
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { showLongDate, todayAsText } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { IconButton, RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { Tabs } from '@/shared/parts/Tabs'
import { addDays, addMonths, parseDate, weekDays } from '../calendarTools'
import { CALENDAR_TABLE, getAllEvents } from '../database'
import { DayView } from '../parts/DayView'
import { EventEditBox } from '../parts/EventEditBox'
import { MonthView } from '../parts/MonthView'
import { WeekView } from '../parts/WeekView'
import type { CalEvent } from '../types'

type ViewId = 'month' | 'week' | 'day'

const VIEW_LIST = [
  { id: 'month', name: 'เดือน' },
  { id: 'week', name: 'สัปดาห์' },
  { id: 'day', name: 'วัน' },
]

/** ชื่อช่วงเวลาที่โชว์ตรงกลางแถบเลื่อน */
function showRangeTitle(view: ViewId, date: string): string {
  if (view === 'month') return parseDate(date).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
  if (view === 'day') return showLongDate(parseDate(date))
  const days = weekDays(date)
  const first = parseDate(days[0])
  const last = parseDate(days[6])
  const sameMonth = first.getMonth() === last.getMonth()
  const firstText = first.toLocaleDateString('th-TH', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' })
  return `${firstText} – ${last.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** กำลังจะเพิ่มกิจกรรม (วันที่ + เวลาเริ่มต้น) */
interface AddingInfo {
  date: string
  time?: string
}

export function CalendarPage() {
  const showMessage = useShowMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: events, isLoading, errorText } = useLiveList({ tableName: CALENDAR_TABLE, getList: getAllEvents })
  const [adding, setAdding] = useState<AddingInfo | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalEvent>()

  const view: ViewId = VIEW_LIST.some((oneView) => oneView.id === searchParams.get('view')) ? (searchParams.get('view') as ViewId) : 'month'
  const dateParam = searchParams.get('date')
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayAsText()

  function go(newView: ViewId, newDate: string) {
    setSearchParams({ view: newView, date: newDate }, { replace: true })
  }

  function move(direction: 1 | -1) {
    if (view === 'month') go(view, addMonths(date, direction))
    else go(view, addDays(date, direction * (view === 'week' ? 7 : 1)))
  }

  // แจ้งเตือนของเบราว์เซอร์ (ต้องให้ผู้ใช้กดขอสิทธิ์เอง)
  const canAskNotification = typeof Notification !== 'undefined' && Notification.permission === 'default'
  async function askNotification() {
    const result = await Notification.requestPermission()
    showMessage(result === 'granted' ? 'เปิดการแจ้งเตือนแล้ว (เตือนตอนเปิดแอพอยู่)' : 'ไม่ได้เปิดการแจ้งเตือน', result === 'granted' ? undefined : 'error')
  }

  return (
    <>
      <PageTitle
        smallLabel="CALENDAR"
        title="ปฏิทิน."
        underText="จดตาราง นัดหมาย สิ่งที่ต้องไม่ลืม"
        rightSide={
          <>
            {canAskNotification && (
              <RoundButton look="plain" size="small" icon={<Bell size={15} />} onClick={askNotification}>
                เปิดแจ้งเตือน
              </RoundButton>
            )}
            <RoundButton look="main" icon={<Plus size={17} />} onClick={() => setAdding({ date: view === 'month' ? todayAsText() : date })}>
              เพิ่ม
            </RoundButton>
          </>
        }
      />

      {/* แถบเลื่อน */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <IconButton label="ก่อนหน้า" onClick={() => move(-1)}>
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton label="ถัดไป" onClick={() => move(1)}>
            <ChevronRight size={20} />
          </IconButton>
          <RoundButton look="plain" size="small" onClick={() => go(view, todayAsText())}>
            วันนี้
          </RoundButton>
        </div>
        <h2 className="order-first w-full text-center font-semibold text-ink sm:order-none sm:w-auto" aria-live="polite">
          {showRangeTitle(view, date)}
        </h2>
        <div className="w-full sm:w-auto">
          <Tabs tabList={VIEW_LIST} selectedId={view} onSelect={(viewId) => go(viewId as ViewId, date)} />
        </div>
      </div>

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}

      {!isLoading && view === 'month' && <MonthView date={date} events={events} onOpenDay={(day) => go('day', day)} onEdit={setEditingEvent} />}
      {!isLoading && view === 'week' && <WeekView date={date} events={events} onOpenDay={(day) => go('day', day)} onEdit={setEditingEvent} onAdd={(day) => setAdding({ date: day })} />}
      {!isLoading && view === 'day' && <DayView date={date} events={events} onEdit={setEditingEvent} onAdd={(day, time) => setAdding({ date: day, time })} />}

      <EventEditBox isOpen={adding !== null} defaultDate={adding?.date ?? date} defaultTime={adding?.time} onClose={() => setAdding(null)} />
      <EventEditBox isOpen={Boolean(editingEvent)} event={editingEvent} defaultDate={date} onClose={() => setEditingEvent(undefined)} />
    </>
  )
}

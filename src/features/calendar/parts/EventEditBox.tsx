// =====================================================================
// EventEditBox : กล่องเด้งสำหรับเพิ่ม / แก้กิจกรรม
//   - event ไม่ใส่ = เพิ่มใหม่ (ใช้ defaultDate / defaultTime เป็นค่าเริ่มต้น)
//   - แก้กิจกรรมที่ซ้ำ = แก้ทุกครั้งที่ซ้ำ / ลบ = ลบทั้งชุดที่ซ้ำ
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addEvent, moveEventToTrash, saveEvent } from '../database'
import { EVENT_COLORS, REMIND_LIST, REPEAT_LIST, type CalEvent, type RepeatKind } from '../types'

interface EventEditBoxProps {
  isOpen: boolean
  event?: CalEvent
  /** วันที่เริ่มต้นตอนเพิ่มใหม่ "2026-10-21" */
  defaultDate: string
  /** เวลาเริ่มต้นตอนเพิ่มใหม่ เช่น "14:00" (ไม่ใส่ = ทั้งวัน) */
  defaultTime?: string
  onClose: () => void
}

/** บวก 1 ชั่วโมงให้เวลา "14:00" → "15:00" (ไม่เกิน 23:59) */
function plusOneHour(time: string) {
  const hour = Number(time.slice(0, 2)) + 1
  return hour > 23 ? '23:59' : `${String(hour).padStart(2, '0')}:${time.slice(3, 5)}`
}

export function EventEditBox({ isOpen, event, defaultDate, defaultTime, onClose }: EventEditBoxProps) {
  const showMessage = useShowMessage()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [eventDate, setEventDate] = useState(defaultDate)
  const [isAllDay, setIsAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [color, setColor] = useState('blue')
  const [repeatKind, setRepeatKind] = useState<RepeatKind>('none')
  const [repeatUntil, setRepeatUntil] = useState('')
  const [remindMinutes, setRemindMinutes] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // เปิดกล่องทีไร ใส่ข้อมูลเริ่มต้นใหม่
  useEffect(() => {
    if (!isOpen) return
    setTitle(event?.title ?? '')
    setNote(event?.note ?? '')
    setEventDate(event?.eventDate ?? defaultDate)
    setIsAllDay(event ? event.isAllDay : !defaultTime)
    setStartTime(event?.startTime ?? defaultTime ?? '09:00')
    setEndTime(event?.endTime ?? plusOneHour(defaultTime ?? '09:00'))
    setColor(event?.color ?? 'blue')
    setRepeatKind(event?.repeatKind ?? 'none')
    setRepeatUntil(event?.repeatUntil ?? '')
    setRemindMinutes(event ? event.remindMinutes : null)
  }, [isOpen, event, defaultDate, defaultTime])

  async function save(submitEvent: FormEvent) {
    submitEvent.preventDefault()
    if (!title.trim()) {
      showMessage('ตั้งชื่อกิจกรรมก่อนนะ', 'error')
      return
    }
    if (!isAllDay && endTime && endTime <= startTime) {
      showMessage('เวลาจบต้องหลังเวลาเริ่ม', 'error')
      return
    }
    if (repeatKind !== 'none' && repeatUntil && repeatUntil < eventDate) {
      showMessage('วันที่ซ้ำถึง ต้องไม่ก่อนวันเริ่ม', 'error')
      return
    }
    setIsSaving(true)
    try {
      const form = {
        title: title.trim(),
        note: note.trim(),
        eventDate,
        isAllDay,
        startTime: isAllDay ? null : startTime,
        endTime: isAllDay ? null : endTime || null,
        color,
        repeatKind,
        repeatUntil: repeatKind === 'none' || !repeatUntil ? null : repeatUntil,
        // เตือนตามเวลาเริ่ม ใช้ได้เฉพาะกิจกรรมที่มีเวลา (ทั้งวัน = เตือน 9:00 ของวันนั้น ดู EventReminders)
        remindMinutes,
      }
      if (event) await saveEvent(event.id, form)
      else await addEvent(form)
      showMessage(event ? 'บันทึกแล้ว' : 'เพิ่มกิจกรรมแล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function moveToTrash() {
    if (!event) return
    try {
      await moveEventToTrash(event.id)
      showMessage('ย้ายไปถังขยะแล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={event ? 'แก้กิจกรรม' : 'เพิ่มกิจกรรม'} onClose={onClose}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <input className="text-input text-lg font-semibold" placeholder="ชื่อกิจกรรม" value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} maxLength={150} autoFocus aria-label="ชื่อกิจกรรม" />

        <input className="text-input" type="date" value={eventDate} onChange={(changeEvent) => setEventDate(changeEvent.target.value)} aria-label="วันที่" required />

        <label className="flex items-center gap-2 text-[15px] text-ink">
          <input type="checkbox" checked={isAllDay} onChange={(changeEvent) => setIsAllDay(changeEvent.target.checked)} className="h-5 w-5 accent-rose" />
          ทั้งวัน
        </label>
        {!isAllDay && (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-soft">เริ่ม</span>
              <input className="text-input" type="time" value={startTime} onChange={(changeEvent) => setStartTime(changeEvent.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-soft">จบ</span>
              <input className="text-input" type="time" value={endTime} onChange={(changeEvent) => setEndTime(changeEvent.target.value)} />
            </label>
          </div>
        )}

        {/* สี */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="สีกิจกรรม">
          {EVENT_COLORS.map((oneColor) => (
            <button
              key={oneColor.id}
              type="button"
              role="radio"
              aria-checked={color === oneColor.id}
              aria-label={oneColor.name}
              title={oneColor.name}
              onClick={() => setColor(oneColor.id)}
              className={`h-8 w-8 rounded-full border-2 transition ${color === oneColor.id ? 'border-ink ring-2 ring-line' : 'border-transparent'}`}
              style={{ backgroundColor: oneColor.hex }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs text-soft">ซ้ำ</span>
            <select className="text-input" value={repeatKind} onChange={(changeEvent) => setRepeatKind(changeEvent.target.value as RepeatKind)}>
              {REPEAT_LIST.map((oneRepeat) => (
                <option key={oneRepeat.id} value={oneRepeat.id}>
                  {oneRepeat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-soft">เตือน</span>
            <select
              className="text-input"
              value={remindMinutes === null ? '' : String(remindMinutes)}
              onChange={(changeEvent) => setRemindMinutes(changeEvent.target.value === '' ? null : Number(changeEvent.target.value))}
            >
              {REMIND_LIST.map((oneRemind) => (
                <option key={oneRemind.name} value={oneRemind.minutes === null ? '' : String(oneRemind.minutes)}>
                  {oneRemind.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {repeatKind !== 'none' && (
          <label className="block">
            <span className="mb-1 block text-xs text-soft">ซ้ำถึงวันที่ (ไม่ใส่ = ไม่สิ้นสุด)</span>
            <input className="text-input" type="date" value={repeatUntil} onChange={(changeEvent) => setRepeatUntil(changeEvent.target.value)} />
          </label>
        )}

        <textarea className="text-input min-h-[72px] resize-y" placeholder="รายละเอียด (ไม่ใส่ก็ได้)" value={note} onChange={(changeEvent) => setNote(changeEvent.target.value)} aria-label="รายละเอียด" />

        {event && event.repeatKind !== 'none' && <p className="text-xs text-soft">กิจกรรมนี้ซ้ำ: แก้หรือลบ จะมีผลกับทุกครั้งที่ซ้ำ</p>}

        <div className="mt-1 flex items-center justify-between gap-2">
          {event ? (
            <RoundButton look="danger" size="small" onClick={moveToTrash}>
              ลบ
            </RoundButton>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <RoundButton look="ghost" onClick={onClose}>
              ยกเลิก
            </RoundButton>
            <RoundButton look="main" type="submit" disabled={isSaving}>
              บันทึก
            </RoundButton>
          </div>
        </div>
      </form>
    </PopupBox>
  )
}

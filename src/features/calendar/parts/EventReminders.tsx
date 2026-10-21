// =====================================================================
// EventReminders : ตัวเตือนกิจกรรม (ทำงานเบื้องหลังทุกหน้า ตราบใดที่เปิดแอพอยู่)
//   - เช็คทุก 30 วินาที ว่ามีกิจกรรมที่ถึงเวลาเตือนไหม
//   - เตือน 2 แบบ: ข้อความเด้งในแอพ + แจ้งเตือนของเบราว์เซอร์ (ถ้าผู้ใช้อนุญาตแล้ว)
//   - กิจกรรมทั้งวันที่ตั้งเตือน = เตือนตอน 9:00 ของวันนั้น
//   - เตือนแต่ละครั้งแค่ครั้งเดียว (จำไว้ใน localStorage) และข้ามที่เลยเวลามาเกิน 15 นาที
//   ⚠️ ปิดแอพ/ปิดแท็บแล้วจะไม่เตือน (ต้องมีเซิร์ฟเวอร์ส่ง push ซึ่งยังไม่ได้ทำ)
// =====================================================================
import { useEffect, useRef } from 'react'
import { toDateText } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addDays, occursOn, parseDate, toMinutes } from '../calendarTools'
import { CALENDAR_TABLE, getAllEvents } from '../database'
import type { CalEvent } from '../types'

const CHECK_EVERY_MS = 30 * 1000
/** เลยเวลาเตือนมาไม่เกินเท่านี้ ถึงจะยังเตือน */
const GRACE_MS = 15 * 60 * 1000
/** เวลาเตือนของกิจกรรมทั้งวัน (นาทีตั้งแต่เที่ยงคืน) */
const ALL_DAY_REMIND_AT = 9 * 60

const FIRED_KEY = 'calendar-reminded'

/** อ่านรายการเตือนที่เคยเตือนไปแล้ว */
function readFired(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function saveFired(keys: string[]) {
  try {
    // เก็บแค่ 200 รายการล่าสุด กันโตไม่หยุด
    localStorage.setItem(FIRED_KEY, JSON.stringify(keys.slice(-200)))
  } catch {
    // จำไม่ได้ก็ไม่เป็นไร (อาจเตือนซ้ำหลังรีเฟรช)
  }
}

export function EventReminders() {
  const showMessage = useShowMessage()
  const { items: events } = useLiveList<CalEvent>({ tableName: CALENDAR_TABLE, getList: getAllEvents })

  // เก็บค่าล่าสุดไว้ให้ตัวจับเวลาใช้ (ไม่ต้องสร้างตัวจับเวลาใหม่ทุกครั้งที่ข้อมูลเปลี่ยน)
  const eventsRef = useRef(events)
  eventsRef.current = events
  const showMessageRef = useRef(showMessage)
  showMessageRef.current = showMessage

  useEffect(() => {
    function check() {
      const now = Date.now()
      const today = toDateText(new Date())
      const fired = readFired()
      let hasNew = false

      // เช็คของเมื่อวาน วันนี้ และพรุ่งนี้ (พรุ่งนี้ไว้สำหรับเตือนล่วงหน้า 1 วัน)
      for (const day of [addDays(today, -1), today, addDays(today, 1)]) {
        for (const event of eventsRef.current) {
          if (event.remindMinutes === null || !occursOn(event, day)) continue
          const startMinutes = event.isAllDay || !event.startTime ? ALL_DAY_REMIND_AT : toMinutes(event.startTime)
          const fireAt = parseDate(day).getTime() + (startMinutes - event.remindMinutes) * 60 * 1000
          const key = `${event.id}:${day}`
          if (now < fireAt || now > fireAt + GRACE_MS || fired.includes(key)) continue

          fired.push(key)
          hasNew = true
          const timeText = event.isAllDay || !event.startTime ? 'ทั้งวัน' : event.startTime
          const text = `⏰ ${event.title} (${day === today ? 'วันนี้' : day} ${timeText})`
          showMessageRef.current(text)
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(event.title, { body: `${day === today ? 'วันนี้' : day} ${timeText}`, tag: key })
          }
        }
      }
      if (hasNew) saveFired(fired)
    }

    check()
    const timer = window.setInterval(check, CHECK_EVERY_MS)
    return () => window.clearInterval(timer)
  }, [])

  return null
}

// =====================================================================
// CaptionReminders : ตัวเตือนแคปชั่นถึงเวลาโพสต์ (ทำงานเบื้องหลังทุกหน้า ตราบใดที่เปิดแอพอยู่)
//   - เช็คทุก 30 วินาที ว่ามีแคปชั่นที่ติ๊ก "เตือน" แล้วถึงเวลาโพสต์ไหม (ยังไม่ติ๊กโพสต์แล้ว)
//   - ไม่ระบุเวลา = เตือน 9:00 ของวันนั้น
//   - เตือนแต่ละใบแค่ครั้งเดียว (จำไว้ใน localStorage) และข้ามที่เลยเวลามาเกิน 15 นาที
//   - เตือน 2 แบบ: ข้อความเด้งในแอพ + แจ้งเตือนของเบราว์เซอร์ (ถ้าผู้ใช้อนุญาตแล้ว)
//   ⚠️ ปิดแอพ/ปิดแท็บแล้วจะไม่เตือน (เหมือนตัวเตือนของปฏิทิน)
// =====================================================================
import { useEffect, useRef } from 'react'
import { useLiveList } from '@/shared/data/useLiveList'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { CAPTIONS_TABLE, getAllShopCaptions } from '../../database'

const CHECK_EVERY_MS = 30 * 1000
/** เลยเวลาเตือนมาไม่เกินเท่านี้ ถึงจะยังเตือน */
const GRACE_MS = 15 * 60 * 1000
/** เวลาเตือนตอนไม่ระบุเวลา (นาทีตั้งแต่เที่ยงคืน) */
const DEFAULT_REMIND_AT = 9 * 60

const FIRED_KEY = 'caption-reminded'

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

/** เวลาเตือน (มิลลิวินาที) จากวันที่ "2026-11-08" + เวลา "14:30" (ไม่มีเวลา = 9:00) */
function getRemindTime(postDate: string, postTime: string | null): number {
  const [year, month, day] = postDate.split('-').map(Number)
  const [hour, minute] = postTime ? postTime.split(':').map(Number) : [Math.floor(DEFAULT_REMIND_AT / 60), DEFAULT_REMIND_AT % 60]
  return new Date(year, month - 1, day, hour, minute).getTime()
}

export function CaptionReminders() {
  const showMessage = useShowMessage()
  const { items: captions } = useLiveList({ tableName: CAPTIONS_TABLE, getList: getAllShopCaptions })

  // เก็บค่าล่าสุดไว้ให้ตัวจับเวลาใช้ (ไม่ต้องสร้างตัวจับเวลาใหม่ทุกครั้งที่ข้อมูลเปลี่ยน)
  const captionsRef = useRef(captions)
  captionsRef.current = captions
  const showMessageRef = useRef(showMessage)
  showMessageRef.current = showMessage

  useEffect(() => {
    function check() {
      const now = Date.now()
      const fired = readFired()
      let hasNew = false

      for (const caption of captionsRef.current) {
        if (!caption.remind || caption.status === 'posted' || !caption.postDate) continue
        const remindTime = getRemindTime(caption.postDate, caption.postTime)
        const key = `${caption.id}:${caption.postDate}:${caption.postTime ?? ''}`
        if (now < remindTime || now > remindTime + GRACE_MS || fired.includes(key)) continue

        fired.push(key)
        hasNew = true
        const firstLine = caption.text.split('\n').find((line) => line.trim())?.trim().slice(0, 50) ?? ''
        showMessageRef.current(`⏰ ถึงเวลาโพสต์แล้ว: ${firstLine}`)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('ถึงเวลาโพสต์แล้ว', { body: firstLine, tag: key })
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

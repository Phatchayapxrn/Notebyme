// =====================================================================
// WriteFutureMessageBox : กล่องเขียนข้อความถึงตัวเองในอนาคต
//   - พิมพ์ข้อความ (ใส่อีโมจิได้)
//   - เลือกวันที่จะเปิดอ่าน: ปุ่มลัด (1 สัปดาห์ / 1 เดือน / ...) หรือเลือกวันเอง
// =====================================================================
import { useRef, useState, type FormEvent } from 'react'
import { CalendarDays, Send } from 'lucide-react'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton } from '@/shared/parts/TagButton'
import { EmojiButton } from '@/shared/parts/EmojiButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { dateFromToday, showFullDate } from '@/shared/dateTools'
import { insertAtCursor } from '@/shared/text/insertText'
import { addFutureMessage } from '../database'

/** ปุ่มลัดเลือกวัน */
const QUICK_DATES = [
  { name: 'พรุ่งนี้', when: { days: 1 } },
  { name: '1 สัปดาห์', when: { days: 7 } },
  { name: '1 เดือน', when: { months: 1 } },
  { name: '6 เดือน', when: { months: 6 } },
  { name: '1 ปี', when: { years: 1 } },
]

export function WriteFutureMessageBox() {
  const showMessage = useShowMessage()
  const textBox = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  const [showDate, setShowDate] = useState(() => dateFromToday({ months: 1 }))
  const [isSending, setIsSending] = useState(false)

  const tomorrow = dateFromToday({ days: 1 })

  async function sendToFuture(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || !showDate) return
    setIsSending(true)
    try {
      await addFutureMessage({ text: text.trim(), showDate })
      showMessage(`เก็บไว้แล้ว จะเปิดอ่านได้วันที่ ${showFullDate(showDate)}`)
      setText('')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={sendToFuture} className="flex flex-col gap-4 rounded-3xl border border-line bg-paper p-4 shadow-soft sm:p-6">
      {/* ช่องพิมพ์ */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="small-label">ถึงตัวฉันในอนาคต</p>
          <EmojiButton onPick={(emoji) => insertAtCursor(textBox.current, text, emoji, setText)} />
        </div>
        <textarea
          ref={textBox}
          className="text-input min-h-[140px] resize-y font-cute leading-relaxed"
          placeholder="ตอนนี้เป็นยังไงบ้าง? ความฝันที่อยากทำได้ทำหรือยัง..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="ข้อความถึงตัวเองในอนาคต"
          maxLength={5000}
        />
      </div>

      {/* เลือกวันเปิดอ่าน */}
      <div>
        <p className="small-label mb-2">เปิดอ่านได้วันที่</p>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_DATES.map((quickDate) => {
            const dateText = dateFromToday(quickDate.when)
            return (
              <TagButton key={quickDate.name} isSelected={showDate === dateText} onClick={() => setShowDate(dateText)}>
                {quickDate.name}
              </TagButton>
            )
          })}
          <label className="relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-2 border-line bg-paper px-3.5 text-sm text-ink hover:border-pink">
            <CalendarDays size={15} aria-hidden="true" />
            เลือกวันเอง
            <input
              type="date"
              aria-label="เลือกวันที่จะเปิดอ่าน"
              className="absolute inset-0 cursor-pointer opacity-0"
              min={tomorrow}
              value={showDate}
              onChange={(event) => event.target.value && setShowDate(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 font-typewriter text-sm text-soft">📅 {showFullDate(showDate)}</p>
      </div>

      <RoundButton look="main" type="submit" icon={<Send size={17} />} disabled={isSending || !text.trim()} className="self-end">
        {isSending ? 'กำลังส่ง...' : 'ส่งไปอนาคต'}
      </RoundButton>
    </form>
  )
}
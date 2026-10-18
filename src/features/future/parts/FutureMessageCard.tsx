// =====================================================================
// FutureMessageCard : ข้อความ 1 ฉบับ
//   - ถึงวันแล้ว : โชว์ข้อความเต็ม (ยังไม่อ่าน = มีป้าย "ใหม่" + ปุ่ม "อ่านแล้ว")
//   - ยังไม่ถึงวัน : ซ่อนข้อความไว้ (กด "แอบดู / แก้ไข" เพื่อเปิดดูและแก้ได้)
// =====================================================================
import { useState } from 'react'
import { Check, Eye, EyeOff, Lock, Trash2 } from 'lucide-react'
import { RoundButton, IconButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { daysUntil, showFullDate, showShortDate } from '@/shared/dateTools'
import { isOpenNow, markFutureMessageRead, moveFutureMessageToTrash, saveFutureMessage } from '../database'
import type { FutureMessage } from '../types'

export function FutureMessageCard({ message }: { message: FutureMessage }) {
  const showMessage = useShowMessage()
  const isOpen = isOpenNow(message)
  const [isPeeking, setIsPeeking] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [editDate, setEditDate] = useState(message.showDate)

  /** ทำงาน แล้วถ้าพลาดให้เด้งข้อความเตือน */
  async function tryTo(action: () => Promise<void>, successText?: string) {
    try {
      await action()
      if (successText) showMessage(successText)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ทำไม่สำเร็จ', 'error')
    }
  }

  function openPeek() {
    setEditText(message.text)
    setEditDate(message.showDate)
    setIsPeeking(true)
  }

  async function saveChanges() {
    if (!editText.trim()) return
    await tryTo(() => saveFutureMessage(message.id, { text: editText.trim(), showDate: editDate }), 'บันทึกแล้ว')
    setIsPeeking(false)
  }

  const deleteButton = (
    <IconButton label="ย้ายไปถังขยะ" onClick={() => tryTo(() => moveFutureMessageToTrash(message.id), 'ย้ายไปถังขยะแล้ว')}>
      <Trash2 size={18} />
    </IconButton>
  )

  // ---------- ถึงวันแล้ว ----------
  if (isOpen) {
    return (
      <article className={`rounded-3xl border bg-paper p-5 shadow-soft ${message.isRead ? 'border-line' : 'border-rose/60'}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-typewriter text-xs text-soft">
              เขียนเมื่อ {showShortDate(message.createdAt)} · เปิดวันที่ {showFullDate(message.showDate)}
            </p>
            {!message.isRead && <span className="mt-1 inline-block rounded-full bg-rose/15 px-2.5 py-0.5 text-xs text-rose">ใหม่</span>}
          </div>
          {deleteButton}
        </div>
        <p className="whitespace-pre-wrap font-cute text-[17px] leading-relaxed text-ink">{message.text}</p>
        {!message.isRead && (
          <div className="mt-4 flex justify-end">
            <RoundButton look="pink" size="small" icon={<Check size={15} />} onClick={() => tryTo(() => markFutureMessageRead(message.id))}>
              อ่านแล้ว
            </RoundButton>
          </div>
        )}
      </article>
    )
  }

  // ---------- ยังไม่ถึงวัน ----------
  const daysLeft = daysUntil(message.showDate)
  return (
    <article className="rounded-3xl border border-dashed border-line bg-paper/60 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-blush text-soft" aria-hidden="true">
          <Lock size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-ink">เปิดได้วันที่ {showFullDate(message.showDate)}</p>
          <p className="font-typewriter text-xs text-soft">
            อีก {daysLeft} วัน · เขียนเมื่อ {showShortDate(message.createdAt)}
          </p>
        </div>
        <IconButton label={isPeeking ? 'ซ่อน' : 'แอบดู / แก้ไข'} onClick={() => (isPeeking ? setIsPeeking(false) : openPeek())}>
          {isPeeking ? <EyeOff size={18} /> : <Eye size={18} />}
        </IconButton>
        {deleteButton}
      </div>

      {isPeeking && (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            className="text-input min-h-[120px] resize-y font-cute"
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            aria-label="แก้ข้อความ"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-soft">
              เปิดวันที่
              <input
                type="date"
                className="rounded-xl border-2 border-line bg-paper px-3 py-1.5 text-ink"
                value={editDate}
                onChange={(event) => event.target.value && setEditDate(event.target.value)}
              />
            </label>
            <RoundButton look="main" size="small" onClick={saveChanges} disabled={!editText.trim()}>
              บันทึก
            </RoundButton>
          </div>
        </div>
      )}
    </article>
  )
}
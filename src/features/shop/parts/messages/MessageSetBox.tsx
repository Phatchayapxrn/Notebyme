// =====================================================================
// MessageSetBox : ชุดข้อความ 1 ชุด
//   - มุมขวาบน : ปุ่ม "คัดลอก" = คัดลอกข้อความทั้งชุด
//   - แก้ข้อความได้เลย (บันทึกเองอัตโนมัติ)
//   - แถบล่าง : เปลี่ยนฟอนต์ / ใส่อีโมจิ / เลื่อนขึ้น-ลง / ลบ
// =====================================================================
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { getDraft, useAutoSave } from '@/shared/data/useAutoSave'
import { CopyButton } from '@/shared/parts/CopyButton'
import { EmojiButton } from '@/shared/parts/EmojiButton'
import { FancyFontButton } from '@/shared/parts/FancyFontButton'
import { IconButton } from '@/shared/parts/RoundButton'
import { SaveStatusText } from '@/shared/parts/SaveStatusText'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { insertAtCursor } from '@/shared/text/insertText'
import { FANCY_STYLES, toFancyLetters } from '@/shared/text/fancyLetters'
import { moveShopMessageToTrash, saveShopMessage } from '../../database'
import type { ShopMessage } from '../../types'

interface MessageSetBoxProps {
  message: ShopMessage
  /** ลำดับที่ (เริ่มที่ 1) */
  setNumber: number
  /** เลื่อนขึ้น / ลง (ไม่ใส่ = เลื่อนไม่ได้ เช่น อยู่บนสุดแล้ว) */
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function MessageSetBox({ message, setNumber, onMoveUp, onMoveDown }: MessageSetBoxProps) {
  const showMessage = useShowMessage()
  const textBox = useRef<HTMLTextAreaElement>(null)
  const isTyping = useRef(false)
  const draftName = `shop-message-${message.id}`
  const [title, setTitle] = useState(message.title)
  const [text, setText] = useState(message.text)

  // บันทึกอัตโนมัติ เมื่อหยุดพิมพ์
  const { saveStatus } = useAutoSave({
    value: { title, text },
    saveValue: (value) => saveShopMessage(message.id, value),
    isReady: true,
    draftName,
  })

  // ถ้ามีร่างค้างในเครื่อง (เคยบันทึกไม่สำเร็จตอนเน็ตหลุด) → ใส่ร่างกลับมา แล้วระบบจะบันทึกขึ้นไปให้เอง
  useEffect(() => {
    const draft = getDraft<{ title: string; text: string }>(draftName)
    if (!draft) return
    setTitle(draft.value.title)
    setText(draft.value.text)
  }, [draftName])

  // ข้อมูลถูกแก้จากเครื่องอื่น → อัปเดตตาม (ถ้าตอนนี้ไม่ได้พิมพ์อยู่ และไม่มีอะไรค้างบันทึก)
  useEffect(() => {
    if (isTyping.current || saveStatus !== 'saved') return
    setTitle(message.title)
    setText(message.text)
  }, [message.title, message.text]) // ตั้งใจไม่ใส่ saveStatus : เช็คแค่ตอนข้อมูลจากฐานข้อมูลเปลี่ยน

  // ช่องพิมพ์ยืดสูงตามข้อความ
  useLayoutEffect(() => {
    const box = textBox.current
    if (!box) return
    box.style.height = 'auto'
    box.style.height = `${Math.max(box.scrollHeight, 96)}px`
  }, [text])

  /** เปลี่ยนฟอนต์ : ถ้าเลือกข้อความไว้ เปลี่ยนเฉพาะส่วนนั้น / ไม่ได้เลือก เปลี่ยนทั้งชุด */
  function changeFont(styleId: string) {
    const box = textBox.current
    const start = box?.selectionStart ?? 0
    const end = box?.selectionEnd ?? 0
    const hasSelection = end > start
    const newText = hasSelection
      ? text.slice(0, start) + toFancyLetters(text.slice(start, end), styleId) + text.slice(end)
      : toFancyLetters(text, styleId)
    setText(newText)

    const style = FANCY_STYLES.find((oneStyle) => oneStyle.id === styleId)
    const hasThai = /[\u0e00-\u0e7f]/.test(hasSelection ? text.slice(start, end) : text)
    if (hasThai && !style?.worksWithThai) showMessage('เปลี่ยนแล้ว (ตัวอักษรไทยจะเหมือนเดิม)')
    else showMessage(hasSelection ? 'เปลี่ยนฟอนต์ส่วนที่เลือกแล้ว' : 'เปลี่ยนฟอนต์ทั้งชุดแล้ว')
  }

  async function moveToTrash() {
    try {
      await moveShopMessageToTrash(message.id)
      showMessage('ย้ายไปถังขยะแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  const letterCount = Array.from(text).length

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
      {/* หัวกล่อง : ลำดับ + ชื่อชุด + ปุ่มคัดลอก (มุมขวาบน) */}
      <header className="flex items-center gap-2 border-b border-line bg-blush/40 py-2 pl-4 pr-2">
        <span className="flex-none rounded-full bg-wine px-2.5 py-0.5 font-typewriter text-xs text-paper">ชุดที่ {setNumber}</span>
        <input
          className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[15px] font-medium text-ink placeholder:text-soft/60 focus:outline-none"
          placeholder="ตั้งชื่อชุด (ไม่ใส่ก็ได้)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label={`ชื่อชุดที่ ${setNumber}`}
          maxLength={100}
        />
        <CopyButton isMain getText={() => text} doneMessage={`คัดลอกชุดที่ ${setNumber} แล้ว`} />
      </header>

      {/* ข้อความ (แก้ได้เลย) */}
      <textarea
        ref={textBox}
        className="block w-full resize-none bg-transparent px-4 py-3 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:outline-none"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onFocus={() => (isTyping.current = true)}
        onBlur={() => (isTyping.current = false)}
        placeholder="พิมพ์หรือวางข้อความตรงนี้..."
        aria-label={`ข้อความชุดที่ ${setNumber}`}
        spellCheck={false}
      />

      {/* แถบล่าง : เครื่องมือ */}
      <footer className="flex flex-wrap items-center gap-0.5 border-t border-line px-2 py-1">
        <FancyFontButton onChoose={changeFont} helpText="เลือกข้อความไว้ก่อน = เปลี่ยนเฉพาะส่วนนั้น / ไม่ได้เลือก = เปลี่ยนทั้งชุด" />
        <EmojiButton onPick={(emoji) => insertAtCursor(textBox.current, text, emoji, setText)} />
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <IconButton label="เลื่อนขึ้น" onClick={onMoveUp} disabled={!onMoveUp} className="h-9 w-9">
          <ArrowUp size={17} />
        </IconButton>
        <IconButton label="เลื่อนลง" onClick={onMoveDown} disabled={!onMoveDown} className="h-9 w-9">
          <ArrowDown size={17} />
        </IconButton>
        <IconButton label="ย้ายไปถังขยะ" onClick={moveToTrash} className="h-9 w-9">
          <Trash2 size={17} />
        </IconButton>
        <div className="flex-1" />
        <span className="px-2 font-typewriter text-xs text-soft">{letterCount} ตัวอักษร</span>
        <SaveStatusText saveStatus={saveStatus} />
      </footer>
    </article>
  )
}
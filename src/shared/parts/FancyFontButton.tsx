// =====================================================================
// FancyFontButton : ปุ่ม "Aa ฟอนต์" กดแล้วเลือกฟอนต์พิเศษ (ตัวหนา / ลายมือ / ในวงกลม / ...)
// ฟอนต์พิเศษคัดลอกไปวางที่อื่นได้ (ดูวิธีทำงานใน src/shared/text/fancyLetters.ts)
//
// ใช้งาน:
//   <FancyFontButton onChoose={(styleId) => เปลี่ยนข้อความด้วย toFancyLetters(ข้อความ, styleId)} />
// =====================================================================
import { useState } from 'react'
import { Type } from 'lucide-react'
import { FANCY_STYLES, showFancyExample } from '@/shared/text/fancyLetters'
import { PopupBox } from './PopupBox'

interface FancyFontButtonProps {
  onChoose: (styleId: string) => void
  /** ข้อความใต้หัวกล่อง เช่น "จะเปลี่ยนเฉพาะข้อความที่เลือกไว้" */
  helpText?: string
}

export function FancyFontButton({ onChoose, helpText }: FancyFontButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="เปลี่ยนฟอนต์"
        title="เปลี่ยนฟอนต์"
        onMouseDown={(event) => event.preventDefault()} // กันช่องพิมพ์เสียโฟกัส (จำส่วนที่เลือกไว้)
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 flex-none items-center gap-1 rounded-xl px-2.5 text-sm text-soft transition hover:bg-blush hover:text-ink"
      >
        <Type size={17} /> ฟอนต์
      </button>

      <PopupBox isOpen={isOpen} title="เลือกฟอนต์" onClose={() => setIsOpen(false)}>
        {helpText && <p className="mb-3 text-sm text-soft">{helpText}</p>}
        <div className="flex max-h-[55dvh] flex-col gap-1 overflow-y-auto">
          {FANCY_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                onChoose(style.id)
                setIsOpen(false)
              }}
              className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-blush"
            >
              <span className="text-[15px] text-ink">
                {style.name}
                {style.worksWithThai && <span className="ml-1.5 text-xs text-rose">ใช้กับภาษาไทยได้</span>}
              </span>
              <span className="text-lg text-ink">{showFancyExample(style.id)}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-soft">* ฟอนต์พิเศษมีแค่ตัวอังกฤษกับตัวเลข ตัวไทยจะเหมือนเดิม (ยกเว้น ขีดฆ่า / ขีดเส้นใต้)</p>
      </PopupBox>
    </>
  )
}
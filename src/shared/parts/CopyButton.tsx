// =====================================================================
// CopyButton : ปุ่ม "คัดลอก" กดแล้วคัดลอกข้อความลงคลิปบอร์ด
// คัดลอกสำเร็จ ปุ่มจะเปลี่ยนเป็นเครื่องหมายถูกแป๊บหนึ่ง
// (จัดบรรทัดให้ก่อนคัดลอก ไม่มีบรรทัดว่างซ้อนกันหลายบรรทัด — ดู src/shared/text/copyText.ts)
//
// ใช้งาน:
//   <CopyButton getText={() => ข้อความที่จะคัดลอก} doneMessage="คัดลอกแล้ว" />
// =====================================================================
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from '@/shared/text/copyText'
import { useShowMessage } from './PopupMessage'

interface CopyButtonProps {
  /** ดึงข้อความที่จะคัดลอก (เรียกตอนกดปุ่ม จะได้ข้อความล่าสุดเสมอ) */
  getText: () => string
  /** ข้อความเด้งหลังคัดลอกเสร็จ */
  doneMessage?: string
  /** ข้อความบนปุ่ม (ไม่ใส่ = "คัดลอก") */
  buttonText?: string
  /** true = ปุ่มสีหลักเด่นๆ */
  isMain?: boolean
  className?: string
}

export function CopyButton({ getText, doneMessage = 'คัดลอกแล้ว', buttonText = 'คัดลอก', isMain = false, className = '' }: CopyButtonProps) {
  const showMessage = useShowMessage()
  const [isCopied, setIsCopied] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function pressCopy() {
    const text = getText()
    if (!text.trim()) {
      showMessage('ยังไม่มีข้อความให้คัดลอก', 'error')
      return
    }
    const isSuccess = await copyText(text)
    if (!isSuccess) {
      showMessage('คัดลอกไม่สำเร็จ ลองกดค้างที่ข้อความแล้วคัดลอกเองนะ', 'error')
      return
    }
    showMessage(doneMessage)
    setIsCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={pressCopy}
      className={`inline-flex h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition active:scale-95 ${
        isMain ? 'bg-wine text-paper shadow-pop-dark hover:bg-wine/90' : 'border border-line bg-paper text-ink hover:bg-blush'
      } ${className}`}
    >
      {isCopied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} />}
      {isCopied ? 'คัดลอกแล้ว' : buttonText}
    </button>
  )
}

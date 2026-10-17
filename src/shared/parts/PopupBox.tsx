// =====================================================================
// PopupBox : กล่องเด้งกลางจอ (ใช้ถามยืนยัน หรือฟอร์มเล็กๆ)
//
// ใช้งาน:
//   <PopupBox isOpen={isOpen} title="แก้ไขหมวด" onClose={() => setIsOpen(false)}>
//     ...ฟอร์ม...
//   </PopupBox>
//
// แบบถามยืนยัน (มีปุ่ม ยกเลิก / ยืนยัน ให้เลย):
//   <ConfirmBox isOpen={...} title="ลบถาวร?" text="กู้คืนไม่ได้อีก" confirmText="ลบเลย"
//               onConfirm={...} onClose={...} isDanger />
// =====================================================================
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { WindowBox } from './WindowBox'
import { IconButton, RoundButton } from './RoundButton'

interface PopupBoxProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function PopupBox({ isOpen, title, onClose, children }: PopupBoxProps) {
  // กด Esc เพื่อปิด
  useEffect(() => {
    if (!isOpen) return
    const whenKeyPressed = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', whenKeyPressed)
    return () => window.removeEventListener('keydown', whenKeyPressed)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      {/* พื้นหลังมืด กดเพื่อปิด */}
      <div className="absolute inset-0 bg-wine/30 backdrop-blur-[2px]" onClick={onClose} />
      <WindowBox
        title={title}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto"
        rightSide={
          <IconButton label="ปิด" onClick={onClose} className="-my-2 h-8 w-8">
            <X size={18} />
          </IconButton>
        }
      >
        {children}
      </WindowBox>
    </div>,
    document.body,
  )
}

interface ConfirmBoxProps {
  isOpen: boolean
  title: string
  text?: string
  confirmText?: string
  isDanger?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** กล่องถามยืนยัน มีปุ่ม "ยกเลิก" กับปุ่มยืนยัน */
export function ConfirmBox({ isOpen, title, text, confirmText = 'ตกลง', isDanger, onConfirm, onClose }: ConfirmBoxProps) {
  return (
    <PopupBox isOpen={isOpen} title={title} onClose={onClose}>
      {text && <p className="mb-5 text-[15px] text-ink">{text}</p>}
      <div className="flex justify-end gap-2">
        <RoundButton look="ghost" onClick={onClose}>
          ยกเลิก
        </RoundButton>
        <RoundButton
          look={isDanger ? 'danger' : 'main'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmText}
        </RoundButton>
      </div>
    </PopupBox>
  )
}

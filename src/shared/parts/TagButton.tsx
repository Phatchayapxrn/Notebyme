// =====================================================================
// TagButton : ปุ่มป้ายเล็กๆ สำหรับเลือกหมวด / เลือกระดับ / กรองรายการ
// ตัวที่เลือกอยู่ (isSelected) จะเป็นพื้นมารูนเข้ม
// ใช้งาน: <TagButton isSelected={...} onClick={...} emoji="📚">เรียน</TagButton>
// =====================================================================
import type { ReactNode } from 'react'

interface TagButtonProps {
  isSelected?: boolean
  onClick?: () => void
  emoji?: string
  /** 'outline' = มีขอบ (ค่าเริ่มต้น), 'flat' = ไม่มีขอบ ตัวพิมพ์ใหญ่ (แบบแถวกรอง) */
  look?: 'outline' | 'flat'
  /** สีพิเศษตอนไม่ได้เลือก เช่น ระดับ "สูง" เป็นสีชมพู */
  colorClass?: string
  children: ReactNode
}

export function TagButton({ isSelected = false, onClick, emoji, look = 'outline', colorClass = '', children }: TagButtonProps) {
  const lookClass =
    look === 'outline'
      ? isSelected
        ? 'border-2 border-wine bg-wine text-paper'
        : `border-2 border-line bg-paper text-ink hover:border-pink ${colorClass}`
      : isSelected
        ? 'bg-wine text-paper'
        : `text-soft hover:bg-blush/70 hover:text-ink ${colorClass}`

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`inline-flex h-9 flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm transition ${look === 'flat' ? 'uppercase tracking-wide' : ''} ${lookClass}`}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {children}
    </button>
  )
}

/** แถวของ TagButton ที่เลื่อนซ้าย-ขวาได้บนมือถือ */
export function TagRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap ${className}`}>{children}</div>
}

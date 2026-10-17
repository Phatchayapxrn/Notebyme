// =====================================================================
// RoundButton : ปุ่มทรงแคปซูล
// แบบ (look):
//   'main'   = พื้นมารูนเข้ม ตัวหนังสือขาว (ปุ่มหลัก เช่น บันทึก)
//   'pink'   = พื้นชมพู มีเงาเลื่อน (เหมือนปุ่ม Home/Rules ในรูปตัวอย่าง)
//   'plain'  = พื้นขาว ขอบชมพู
//   'danger' = สีแดง (ปุ่มลบ)
//   'ghost'  = ไม่มีพื้น (ปุ่มเล็กๆ ที่ไม่อยากให้เด่น)
// ใช้งาน: <RoundButton look="main" onClick={...}>บันทึก</RoundButton>
// =====================================================================
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonLook = 'main' | 'pink' | 'plain' | 'danger' | 'ghost'
type ButtonSize = 'small' | 'normal' | 'big'

interface RoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  look?: ButtonLook
  size?: ButtonSize
  /** ไอคอนหน้าข้อความ */
  icon?: ReactNode
  children?: ReactNode
}

const lookClasses: Record<ButtonLook, string> = {
  main: 'bg-wine text-paper shadow-pop-dark hover:bg-wine/90',
  pink: 'bg-blush text-ink shadow-pop hover:bg-pink/70',
  plain: 'bg-paper text-ink border-2 border-line hover:border-pink hover:bg-blush/40',
  danger: 'bg-paper text-danger border-2 border-danger/30 hover:bg-danger hover:text-paper',
  ghost: 'text-soft hover:bg-blush/70 hover:text-ink',
}

const sizeClasses: Record<ButtonSize, string> = {
  small: 'h-9 px-3.5 text-sm gap-1.5',
  normal: 'h-11 px-5 text-[15px] gap-2',
  big: 'h-14 px-7 text-base gap-2 tracking-wide',
}

export function RoundButton({
  look = 'plain',
  size = 'normal',
  icon,
  children,
  className = '',
  type = 'button',
  ...otherProps
}: RoundButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex flex-none select-none items-center justify-center rounded-full font-medium transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 ${lookClasses[look]} ${sizeClasses[size]} ${className}`}
      {...otherProps}
    >
      {icon}
      {children}
    </button>
  )
}

/** ปุ่มไอคอนกลมๆ (ไม่มีข้อความ) — ต้องใส่ label เสมอ เพื่อบอกว่าปุ่มนี้ทำอะไร */
export function IconButton({
  label,
  children,
  className = '',
  type = 'button',
  ...otherProps
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-grid h-10 w-10 flex-none place-items-center rounded-full text-soft transition hover:bg-blush hover:text-ink disabled:opacity-40 ${className}`}
      {...otherProps}
    >
      {children}
    </button>
  )
}

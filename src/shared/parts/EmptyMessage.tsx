// =====================================================================
// EmptyMessage : ข้อความตอนยังไม่มีข้อมูล (เช่น "ยังไม่มีไอเดีย")
// ใช้งาน: <EmptyMessage emoji="🌸" title="ยังไม่มีไอเดีย" text="กด + เพื่อเริ่มจด" />
// =====================================================================
import type { ReactNode } from 'react'

interface EmptyMessageProps {
  emoji?: string
  title: string
  text?: string
  /** ปุ่มหรืออะไรก็ได้ ใต้ข้อความ */
  children?: ReactNode
}

export function EmptyMessage({ emoji = '🌸', title, text, children }: EmptyMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line px-6 py-10 text-center">
      <div className="text-4xl" aria-hidden="true">
        {emoji}
      </div>
      <p className="font-cute text-lg text-ink">{title}</p>
      {text && <p className="max-w-xs text-sm text-soft">{text}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}

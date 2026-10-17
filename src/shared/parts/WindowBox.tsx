// =====================================================================
// WindowBox : กล่องหน้าต่างแบบย้อนยุค มีจุดสามจุด ●○○ และแถบชื่อด้านบน
// ใช้งาน:
//   <WindowBox title="ideas.exe">เนื้อหา</WindowBox>
//   <WindowBox title="..." rightSide={<ปุ่มอะไรก็ได้ />}>...</WindowBox>
// =====================================================================
import type { ReactNode } from 'react'

interface WindowBoxProps {
  /** ชื่อบนแถบด้านบน */
  title?: ReactNode
  /** ของที่จะวางมุมขวาของแถบด้านบน (เช่น ปุ่มปิด) */
  rightSide?: ReactNode
  /** เพิ่ม class ให้กล่องนอกสุด */
  className?: string
  /** เพิ่ม class ให้ส่วนเนื้อหา (ค่าเริ่มต้นมีระยะขอบ p-4) */
  insideClassName?: string
  children: ReactNode
}

export function WindowBox({ title, rightSide, className = '', insideClassName = 'p-4 sm:p-5', children }: WindowBoxProps) {
  return (
    <section className={`overflow-hidden rounded-3xl border-[1.5px] border-wine/25 bg-paper shadow-soft ${className}`}>
      {/* แถบด้านบน */}
      <header className="flex items-center gap-3 border-b-[1.5px] border-wine/15 bg-blush/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-wine" />
          <span className="h-3 w-3 rounded-full border-[1.5px] border-wine/60 bg-paper" />
          <span className="h-3 w-3 rounded-full border-[1.5px] border-wine/40 bg-pink" />
        </span>
        <div className="min-w-0 flex-1 truncate text-center font-typewriter text-sm text-soft">{title}</div>
        <div className="flex min-w-[42px] justify-end">{rightSide}</div>
      </header>
      {/* เนื้อหา */}
      <div className={insideClassName}>{children}</div>
    </section>
  )
}

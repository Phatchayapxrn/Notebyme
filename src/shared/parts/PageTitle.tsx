// =====================================================================
// PageTitle : หัวข้อใหญ่ของแต่ละหน้า (แบบรูป "CAPTURE / To-do. / Quick-fire tasks")
// ใช้งาน:
//   <PageTitle smallLabel="CAPTURE" title="สิ่งที่ต้องทำ." underText="จดไว้ก่อน ไม่ต้องรีบ" />
// =====================================================================
import type { ReactNode } from 'react'

interface PageTitleProps {
  /** ป้ายตัวเล็กด้านบน (ตัวพิมพ์ใหญ่ห่างๆ) */
  smallLabel?: string
  title: ReactNode
  /** ข้อความเอียงใต้หัวข้อ */
  underText?: string
  /** ปุ่มหรืออะไรก็ได้ทางขวา */
  rightSide?: ReactNode
}

export function PageTitle({ smallLabel, title, underText, rightSide }: PageTitleProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {smallLabel && <p className="small-label mb-5 tracking-label">{smallLabel}</p>}
        <h1 className="font-title text-[2.5rem] font-semibold pt-1 leading-[1.45] text-wine sm:text-5xl">{title}</h1>
        {underText && <p className="mt-2 font-title text-lg italic text-soft">{underText}</p>}
        <div className="mt-4 h-px w-20 bg-wine/30" aria-hidden="true" />
      </div>
      {rightSide && <div className="flex flex-none items-center gap-2 pb-5">{rightSide}</div>}
    </header>
  )
}

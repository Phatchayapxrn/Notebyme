// =====================================================================
// GroupCard : การ์ดหมวดหมู่ มีภาพปกด้านบน (แบบรูป Dashboard)
// ใช้งาน: <GroupCard group={group} countText="12 ไอเดีย" onClick={...} />
// =====================================================================
import type { Group } from './groupTypes'
import { GroupCover } from './GroupCover'

interface GroupCardProps {
  group: Pick<Group, 'name' | 'emoji' | 'color' | 'coverPicture'>
  /** ข้อความตัวเลข เช่น "12 ไอเดีย" */
  countText?: string
  /** ป้ายมุมซ้ายบน เช่น "100%" */
  cornerText?: string
  onClick?: () => void
}

export function GroupCard({ group, countText, cornerText, onClick }: GroupCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/card flex w-full flex-col overflow-hidden rounded-2xl border-[1.5px] border-line bg-paper text-left shadow-pop transition hover:-translate-y-0.5 hover:border-pink"
    >
      <div className="relative">
        <GroupCover coverPicture={group.coverPicture} color={group.color} className="h-24 w-full sm:h-28" />
        {cornerText && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-paper/90 px-2.5 py-0.5 font-typewriter text-xs text-ink">
            {cornerText}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 border-t-[1.5px] border-line px-3.5 py-3">
        <span className="truncate font-cute text-[15px] text-ink">
          <span aria-hidden="true">{group.emoji}</span> {group.name}
        </span>
        {countText && <span className="font-typewriter text-xs text-soft">{countText}</span>}
      </div>
    </button>
  )
}

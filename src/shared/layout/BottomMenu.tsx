// =====================================================================
// BottomMenu : เมนูไอคอนด้านล่างจอ (แสดงเฉพาะมือถือ)
// ปุ่มที่เลือกอยู่เป็นกล่องสีหลัก (เข้มในโหมดสว่าง / อ่อนในโหมดมืด)
// ปุ่มแบ่งความกว้างจอเท่าๆ กัน → มี 7-8 เมนูก็ยังพอดีจอมือถือ
// =====================================================================
import { NavLink } from 'react-router-dom'
import type { AppFeature } from '@/features/AppFeature'

export function BottomMenu({ menuFeatures }: { menuFeatures: AppFeature[] }) {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="space-for-bottom-bar fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/90 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center gap-0.5 px-1.5 pb-1 pt-2">
        {menuFeatures.map((feature) => (
          <NavLink
            key={feature.id}
            to={feature.mainPath}
            end={feature.mainPath === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-0.5 whitespace-nowrap rounded-2xl px-0.5 py-2 text-[10px] transition ${
                isActive ? 'bg-wine text-paper' : 'text-soft'
              }`
            }
          >
            <feature.menuIcon size={21} strokeWidth={1.6} aria-hidden="true" />
            {feature.menuName}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

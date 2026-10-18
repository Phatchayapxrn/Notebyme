// =====================================================================
// SideMenu : เมนูไอคอนด้านซ้าย (แสดงเฉพาะจอคอม / แท็บเล็ต)
// รายการในเมนูมาจาก allFeatures อัตโนมัติ
// =====================================================================
import { NavLink } from 'react-router-dom'
import type { AppFeature } from '@/features/AppFeature'
import { ThemeButton } from '@/shared/theme/ThemeButton'

export function SideMenu({ menuFeatures }: { menuFeatures: AppFeature[] }) {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="hide-scrollbar fixed inset-y-0 left-0 z-20 hidden w-24 flex-col items-center gap-1.5 overflow-y-auto border-r border-line bg-paper py-6 md:flex"
    >
      {/* โลโก้ */}
      <NavLink to="/" className="mb-6 font-title text-2xl font-semibold italic text-wine" aria-label="หน้าแรก">
        Idea.
      </NavLink>
      {menuFeatures.map((feature) => (
        <NavLink
          key={feature.id}
          to={feature.mainPath}
          end={feature.mainPath === '/'}
          className={({ isActive }) =>
            `flex w-[72px] flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] transition ${
              isActive ? 'bg-wine text-paper shadow-pop-dark' : 'text-soft hover:bg-blush hover:text-ink'
            }`
          }
        >
          <feature.menuIcon size={22} strokeWidth={1.6} aria-hidden="true" />
          {feature.menuName}
        </NavLink>
      ))}
      {/* ปุ่มสลับโหมดมืด อยู่ล่างสุด */}
      <div className="mt-auto pt-4">
        <ThemeButton />
      </div>
    </nav>
  )
}

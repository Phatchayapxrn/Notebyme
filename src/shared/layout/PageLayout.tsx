// =====================================================================
// PageLayout : โครงหน้าหลักของแอพ
//   จอคอม  : เมนูซ้าย | เนื้อหาตรงกลาง | แถบขวา
//   มือถือ : หัวเว็บด้านบน | เนื้อหา | เมนูล่าง
// เนื้อหาของแต่ละหน้าจะไปโผล่ตรง <Outlet />
// =====================================================================
import { Link, Outlet } from 'react-router-dom'
import type { AppFeature } from '@/features/AppFeature'
import { ThemeButton } from '@/shared/theme/ThemeButton'
import { SideMenu } from './SideMenu'
import { BottomMenu } from './BottomMenu'
import { RightSideBox } from './RightSideBox'
import type { LayoutContext } from './useAllFeatures'

export function PageLayout({ features }: { features: AppFeature[] }) {
  // เอาเฉพาะระบบที่ต้องโชว์ในเมนู แล้วเรียงตามลำดับ
  const menuFeatures = features
    .filter((feature) => feature.showInMenu !== false && !feature.isPublic)
    .sort((first, second) => first.menuOrder - second.menuOrder)

  const hasSideBox = features.some((feature) => feature.sideCard)

  return (
    <div className="min-h-dvh">
      <SideMenu menuFeatures={menuFeatures} />

      {/* หัวเว็บ (มือถือ) */}
      <header className="space-for-top-notch flex items-center justify-between px-5 pt-4 md:hidden">
        <Link to="/" className="font-title text-3xl font-semibold italic text-wine">
          Idea.
        </Link>
        <ThemeButton className="-mr-2" />
      </header>

      {/* เนื้อหาของหน้า */}
      <main className={`px-4 pb-32 pt-4 sm:px-6 md:ml-24 md:pb-16 md:pt-10 ${hasSideBox ? 'xl:mr-80' : ''}`}>
        <div className="mx-auto w-full max-w-4xl">
          <Outlet context={{ features } satisfies LayoutContext} />
        </div>
      </main>

      <RightSideBox features={features} />
      <BottomMenu menuFeatures={menuFeatures} />
    </div>
  )
}

// =====================================================================
// PageLayout : โครงหน้าหลักของแอพ
//   จอคอม  : เมนูซ้าย | เนื้อหาตรงกลาง | แถบขวา
//   มือถือ : หัวเว็บด้านบน | เนื้อหา | เมนูล่าง
// เนื้อหาของแต่ละหน้าจะไปโผล่ตรง <Outlet />
// ระบบที่ไม่มีสิทธิ์เห็น (ยศ) จะถูกเอาออกจากเมนู หน้าแรก ถังขยะ และแถบขวา ตั้งแต่ตรงนี้
// =====================================================================
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { AppFeature } from '@/features/AppFeature'
import { ThemeButton } from '@/shared/theme/ThemeButton'
import { useAccess } from '@/shared/access/AccessProvider'
import { SyncBadge } from '@/shared/offline/SyncBadge'
import { IconButton } from '@/shared/parts/RoundButton'
import { SearchBox } from '@/shared/search/SearchBox'
import { SideMenu } from './SideMenu'
import { BottomMenu } from './BottomMenu'
import { RightSideBox } from './RightSideBox'
import type { LayoutContext } from './useAllFeatures'

export function PageLayout({ features: allLoginFeatures }: { features: AppFeature[] }) {
  // เอาเฉพาะระบบที่คนนี้มีสิทธิ์เห็น
  const { canSee } = useAccess()
  const features = allLoginFeatures.filter((feature) => canSee(feature.id))

  // เอาเฉพาะระบบที่ต้องโชว์ในเมนู แล้วเรียงตามลำดับ
  const menuFeatures = features
    .filter((feature) => feature.showInMenu !== false && !feature.isPublic)
    .sort((first, second) => first.menuOrder - second.menuOrder)

  const hasSideBox = features.some((feature) => feature.sideCard)

  // ช่องค้นหากลาง: เปิดด้วย Ctrl+K (Mac: Cmd+K) หรือกด / (ตอนไม่ได้พิมพ์อยู่ในช่องอื่น)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  useEffect(() => {
    function whenKeyPressed(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      } else if (event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', whenKeyPressed)
    return () => window.removeEventListener('keydown', whenKeyPressed)
  }, [])

  return (
    <div className="min-h-dvh">
      <SyncBadge />
      <SearchBox isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} features={features} />
      {/* ส่วนเบื้องหลังของแต่ละระบบ (เฉพาะระบบที่มีสิทธิ์) */}
      {features.map((feature) => (feature.backgroundPart ? <feature.backgroundPart key={feature.id} /> : null))}
      <SideMenu menuFeatures={menuFeatures} onSearch={() => setIsSearchOpen(true)} />

      {/* หัวเว็บ (มือถือ) */}
      <header className="space-for-top-notch flex items-center justify-between px-5 pt-4 md:hidden">
        <Link to="/" className="font-title text-3xl font-semibold italic text-wine">
          Idea.
        </Link>
        <div className="-mr-2 flex items-center">
          <IconButton label="ค้นหา" onClick={() => setIsSearchOpen(true)}>
            <Search size={20} />
          </IconButton>
          <ThemeButton />
        </div>
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

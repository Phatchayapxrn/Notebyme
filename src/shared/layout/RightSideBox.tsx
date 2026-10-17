// =====================================================================
// RightSideBox : แถบด้านขวา (แสดงเฉพาะจอคอมกว้างๆ)
// รวม sideCard ของทุกระบบมาแสดง (เช่น งานวันนี้ + วงกลม %)
// =====================================================================
import type { AppFeature } from '@/features/AppFeature'

export function RightSideBox({ features }: { features: AppFeature[] }) {
  const featuresWithSideCard = features.filter((feature) => feature.sideCard)
  if (featuresWithSideCard.length === 0) return null

  return (
    <aside
      aria-label="สรุปด้านข้าง"
      className="fixed inset-y-0 right-0 z-10 hidden w-80 flex-col gap-6 overflow-y-auto border-l-[1.5px] border-line bg-paper/60 px-5 py-8 xl:flex"
    >
      {featuresWithSideCard.map((feature) => {
        const SideCard = feature.sideCard!
        return <SideCard key={feature.id} />
      })}
    </aside>
  )
}

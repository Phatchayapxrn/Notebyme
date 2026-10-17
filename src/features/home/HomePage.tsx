// =====================================================================
// HomePage : หน้าแรก (/) ภาพรวมทั้งหมด
// แสดงวันที่ + การ์ดของทุกระบบที่มี homeCard (เรียงตามลำดับเมนู)
// ระบบใหม่ที่มี homeCard จะมาโผล่ในหน้านี้เองอัตโนมัติ
// =====================================================================
import { useAllFeatures } from '@/shared/layout/useAllFeatures'
import { PageTitle } from '@/shared/parts/PageTitle'
import { showLongDate } from '@/shared/dateTools'

/** คำทักทายตามช่วงเวลา */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'ดึกแล้วนะ พักผ่อนบ้าง'
  if (hour < 12) return 'อรุณสวัสดิ์ วันนี้มีไอเดียอะไรบ้าง'
  if (hour < 17) return 'สวัสดีตอนบ่าย สู้ๆ นะ'
  return 'สวัสดีตอนเย็น วันนี้เป็นยังไงบ้าง'
}

export function HomePage() {
  const features = useAllFeatures()
  const featuresWithHomeCard = features
    .filter((feature) => feature.homeCard)
    .sort((first, second) => first.menuOrder - second.menuOrder)

  return (
    <>
      <PageTitle smallLabel="TODAY" title={showLongDate()} underText={getGreeting()} />
      <div className="flex flex-col gap-10">
        {featuresWithHomeCard.map((feature) => {
          const HomeCard = feature.homeCard!
          return <HomeCard key={feature.id} />
        })}
      </div>
    </>
  )
}

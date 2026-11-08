// =====================================================================
// ShopPage : หน้าจัดการร้าน (/shop) แบ่งเป็น 2 แท็บ
//   ข้อความ  = ชุดข้อความ วางไว้แล้วกดคัดลอกไปใช้ (มีฟอนต์พิเศษ + อีโมจิ)
//   แคปชั่น  = แคปชั่นโพสต์ + วางแผนวันโพสต์ (วันนี้ / ที่กำลังจะถึง / คลังสำรอง)
// แท็บที่เลือกจำไว้ในลิงก์ เช่น /shop?tab=captions (กดย้อนกลับแล้วยังอยู่แท็บเดิม)
// =====================================================================
import { useSearchParams } from 'react-router-dom'
import { PageTitle } from '@/shared/parts/PageTitle'
import { Tabs } from '@/shared/parts/Tabs'
import { MessageSetsTab } from '../parts/messages/MessageSetsTab'
import { CaptionsTab } from '../parts/captions/CaptionsTab'

const TAB_LIST = [
  { id: 'messages', name: '💬 ข้อความ' },
  { id: 'captions', name: '📅 แคปชั่น' },
]

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTab = TAB_LIST.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab')! : 'messages'

  return (
    <>
      <PageTitle smallLabel="MY SHOP" title="ร้านของฉัน." underText="ชุดข้อความและแคปชั่นโพสต์ รวมไว้ที่เดียว" />

      <Tabs tabList={TAB_LIST} selectedId={selectedTab} onSelect={(tabId) => setSearchParams({ tab: tabId }, { replace: true })} />
      <div className="pt-5">
        {selectedTab === 'messages' && <MessageSetsTab />}
        {selectedTab === 'captions' && <CaptionsTab />}
      </div>
    </>
  )
}

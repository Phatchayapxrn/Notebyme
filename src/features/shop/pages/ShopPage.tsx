// =====================================================================
// ShopPage : หน้าจัดการร้าน (/shop) แบ่งเป็น 3 แท็บ
//   ข้อความ  = ชุดข้อความ วางไว้แล้วกดคัดลอกไปใช้ (มีฟอนต์พิเศษ + อีโมจิ)
//   สินค้า   = รายการสินค้า ราคา จำนวนในสต็อก
//   ออเดอร์  = ออเดอร์ลูกค้า + สถานะ (รอโอน / รอส่ง / ส่งแล้ว)
// แท็บที่เลือกจำไว้ในลิงก์ เช่น /shop?tab=orders (กดย้อนกลับแล้วยังอยู่แท็บเดิม)
// =====================================================================
import { useSearchParams } from 'react-router-dom'
import { PageTitle } from '@/shared/parts/PageTitle'
import { Tabs } from '@/shared/parts/Tabs'
import { MessageSetsTab } from '../parts/messages/MessageSetsTab'
import { ProductsTab } from '../parts/products/ProductsTab'
import { OrdersTab } from '../parts/orders/OrdersTab'

const TAB_LIST = [
  { id: 'messages', name: '💬 ข้อความ' },
  { id: 'products', name: '📦 สินค้า' },
  { id: 'orders', name: '🧾 ออเดอร์' },
]

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTab = TAB_LIST.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab')! : 'messages'

  return (
    <>
      <PageTitle smallLabel="MY SHOP" title="ร้านของฉัน." underText="ข้อความ สินค้า ออเดอร์ รวมไว้ที่เดียว" />

      <Tabs tabList={TAB_LIST} selectedId={selectedTab} onSelect={(tabId) => setSearchParams({ tab: tabId }, { replace: true })} />
      <div className="pt-5">
        {selectedTab === 'messages' && <MessageSetsTab />}
        {selectedTab === 'products' && <ProductsTab />}
        {selectedTab === 'orders' && <OrdersTab />}
      </div>
    </>
  )
}
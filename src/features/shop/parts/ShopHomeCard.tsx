// =====================================================================
// ShopHomeCard : ส่วนของ "ร้าน" ที่ไปโชว์ในหน้าแรก
// สรุปสั้นๆ: ออเดอร์รอโอน / รอส่ง / สินค้าใกล้หมด (กดแล้วไปหน้าร้าน)
// ยังไม่มีข้อมูลร้านเลย → ไม่โชว์อะไร
// =====================================================================
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { ORDERS_TABLE, PRODUCTS_TABLE, getAllOrders, getAllProducts } from '../database'
import { LOW_STOCK_NUMBER } from '../types'

export function ShopHomeCard() {
  const { items: orders } = useLiveList({ tableName: ORDERS_TABLE, getList: getAllOrders })
  const { items: products } = useLiveList({ tableName: PRODUCTS_TABLE, getList: getAllProducts })
  if (orders.length === 0 && products.length === 0) return null

  const summaryList = [
    { emoji: '⏳', label: 'รอโอน', count: orders.filter((order) => order.status === 'waiting').length, link: '/shop?tab=orders' },
    { emoji: '📦', label: 'รอส่ง', count: orders.filter((order) => order.status === 'paid').length, link: '/shop?tab=orders' },
    { emoji: '⚠️', label: 'สินค้าใกล้หมด', count: products.filter((product) => product.stock <= LOW_STOCK_NUMBER).length, link: '/shop?tab=products' },
  ]

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="small-label">ร้านค้า</h2>
        <Link to="/shop" className="flex items-center gap-1 text-sm text-wine hover:underline">
          ไปที่ร้าน <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {summaryList.map((summary) => (
          <Link key={summary.label} to={summary.link} className="rounded-2xl border border-line bg-paper px-3 py-3 text-center transition hover:bg-blush">
            <p className="font-title text-2xl font-semibold text-wine">{summary.count}</p>
            <p className="mt-0.5 text-xs text-soft">
              <span aria-hidden="true">{summary.emoji}</span> {summary.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
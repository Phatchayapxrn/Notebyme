// =====================================================================
// ShopHomeCard : ส่วนของ "ร้าน" ที่ไปโชว์ในหน้าแรก
// สรุปสั้นๆ: แคปชั่นที่ต้องโพสต์วันนี้ / เลยกำหนดแล้วยังไม่ได้โพสต์ (กดแล้วไปแท็บแคปชั่น)
// ยังไม่มีแคปชั่นเลย → ไม่โชว์อะไร
// =====================================================================
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { todayAsText } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { CAPTIONS_TABLE, getAllShopCaptions } from '../database'

export function ShopHomeCard() {
  const { items: captions } = useLiveList({ tableName: CAPTIONS_TABLE, getList: getAllShopCaptions })
  if (captions.length === 0) return null

  const today = todayAsText()
  const notPosted = captions.filter((caption) => caption.status !== 'posted' && caption.postDate)
  const summaryList = [
    { emoji: '📌', label: 'แคปชั่นวันนี้', count: notPosted.filter((caption) => caption.postDate === today).length },
    { emoji: '⚠️', label: 'เลยกำหนด ยังไม่โพสต์', count: notPosted.filter((caption) => caption.postDate! < today).length },
  ]

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="small-label">ร้านค้า</h2>
        <Link to="/shop?tab=captions" className="flex items-center gap-1 text-sm text-wine hover:underline">
          ไปที่แคปชั่น <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {summaryList.map((summary) => (
          <Link key={summary.label} to="/shop?tab=captions" className="rounded-2xl border border-line bg-paper px-3 py-3 text-center transition hover:bg-blush">
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

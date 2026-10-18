// =====================================================================
// OrdersTab : แท็บ "ออเดอร์" ในหน้าร้าน
//   - สรุป: ยอดขายเดือนนี้ (โอนแล้ว + ส่งแล้ว) / ออเดอร์ที่ค้างอยู่
//   - กรองตามสถานะ: ทั้งหมด / รอโอน / โอนแล้ว รอส่ง / ส่งแล้ว
//   - แต่ละออเดอร์: กดป้ายสถานะ = เปลี่ยนเป็นขั้นถัดไป, ปุ่มคัดลอกรายละเอียด, กดชื่อ = แก้ไข
// =====================================================================
import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { CopyButton } from '@/shared/parts/CopyButton'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { showShortDate } from '@/shared/dateTools'
import { ORDERS_TABLE, getAllOrders, saveOrder } from '../../database'
import { ORDER_STATUS_INFO, showMoney, type Order, type OrderStatus } from '../../types'
import { OrderEditBox } from './OrderEditBox'

/** true = ออเดอร์นี้สร้างในเดือนนี้ */
function isThisMonth(dateText: string): boolean {
  const date = new Date(dateText)
  const today = new Date()
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()
}

export function OrdersTab() {
  const showMessage = useShowMessage()
  const { items: orders, isLoading } = useLiveList({ tableName: ORDERS_TABLE, getList: getAllOrders })
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false)

  const shownOrders = selectedStatus === 'all' ? orders : orders.filter((order) => order.status === selectedStatus)

  const monthSales = useMemo(
    () => orders.filter((order) => order.status !== 'waiting' && isThisMonth(order.createdAt)).reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  )
  const countOf = (status: OrderStatus) => orders.filter((order) => order.status === status).length

  function openEditBox(order: Order | null) {
    setEditingOrder(order)
    setIsEditBoxOpen(true)
  }

  /** กดป้ายสถานะ → เปลี่ยนเป็นขั้นถัดไป */
  async function goToNextStatus(order: Order) {
    const nextStatus = ORDER_STATUS_INFO[order.status].nextStatus
    try {
      await saveOrder(order.id, { status: nextStatus })
      showMessage(`เปลี่ยนเป็น "${ORDER_STATUS_INFO[nextStatus].name}" แล้ว`)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    }
  }

  if (isLoading) return <LoadingDots />

  return (
    <div className="flex flex-col gap-4">
      {/* สรุป */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryBox label="ยอดขายเดือนนี้" value={showMoney(monthSales)} />
        <SummaryBox label="รอโอน" value={String(countOf('waiting'))} />
        <SummaryBox label="รอส่ง" value={String(countOf('paid'))} />
      </div>

      {/* กรอง + เพิ่ม */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TagRow className="flex-1">
          <TagButton look="flat" isSelected={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')}>
            ทั้งหมด ({orders.length})
          </TagButton>
          {(Object.keys(ORDER_STATUS_INFO) as OrderStatus[]).map((status) => (
            <TagButton key={status} look="flat" isSelected={selectedStatus === status} onClick={() => setSelectedStatus(status)}>
              {ORDER_STATUS_INFO[status].name} ({countOf(status)})
            </TagButton>
          ))}
        </TagRow>
        <RoundButton look="main" icon={<Plus size={17} />} onClick={() => openEditBox(null)}>
          เพิ่มออเดอร์
        </RoundButton>
      </div>

      {/* รายการออเดอร์ */}
      {shownOrders.length === 0 ? (
        <EmptyMessage emoji="🧾" title={orders.length === 0 ? 'ยังไม่มีออเดอร์' : 'ไม่มีออเดอร์สถานะนี้'} text={orders.length === 0 ? 'กด "เพิ่มออเดอร์" เมื่อมีลูกค้าสั่งของ' : undefined} />
      ) : (
        <div className="flex flex-col gap-2">
          {shownOrders.map((order) => {
            const statusInfo = ORDER_STATUS_INFO[order.status]
            return (
              <article key={order.id} className={`rounded-2xl border border-line bg-paper px-4 py-3 shadow-pop ${order.status === 'sent' ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => openEditBox(order)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[16px] text-ink">{order.customerName || 'ไม่ระบุชื่อ'}</p>
                    <p className="font-typewriter text-xs text-soft">
                      {showShortDate(order.createdAt)} · {showMoney(order.totalPrice)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToNextStatus(order)}
                    title={`กดเพื่อเปลี่ยนเป็น "${ORDER_STATUS_INFO[statusInfo.nextStatus].name}"`}
                    className={`flex-none rounded-full px-3 py-1 text-xs transition hover:opacity-80 ${statusInfo.badgeClass}`}
                  >
                    {statusInfo.emoji} {statusInfo.name}
                  </button>
                </div>
                {order.detail && (
                  <div className="mt-2 flex items-start gap-2">
                    <p className="line-clamp-3 flex-1 whitespace-pre-wrap text-sm text-soft">{order.detail}</p>
                    <CopyButton getText={() => order.detail} buttonText="คัดลอก" doneMessage="คัดลอกรายละเอียดแล้ว" className="h-8 px-3 text-xs" />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <OrderEditBox isOpen={isEditBoxOpen} order={editingOrder} onClose={() => setIsEditBoxOpen(false)} />
    </div>
  )
}

/** กล่องตัวเลขสรุป */
function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper px-3 py-3 text-center">
      <p className="truncate font-title text-xl font-semibold text-wine sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs text-soft">{label}</p>
    </div>
  )
}
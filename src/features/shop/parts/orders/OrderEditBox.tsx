// =====================================================================
// OrderEditBox : กล่องเด้ง เพิ่ม / แก้ไข ออเดอร์ (ชื่อลูกค้า / รายละเอียด / ยอดรวม / สถานะ)
// ใช้งาน:
//   <OrderEditBox isOpen={...} order={ออเดอร์ที่จะแก้ หรือ null = เพิ่มใหม่} onClose={...} />
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton } from '@/shared/parts/TagButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addOrder, moveOrderToTrash, saveOrder } from '../../database'
import { ORDER_STATUS_INFO, toNumber, type Order, type OrderStatus } from '../../types'

interface OrderEditBoxProps {
  isOpen: boolean
  /** null = เพิ่มออเดอร์ใหม่ */
  order: Order | null
  onClose: () => void
}

export function OrderEditBox({ isOpen, order, onClose }: OrderEditBoxProps) {
  const showMessage = useShowMessage()
  const [customerName, setCustomerName] = useState('')
  const [detail, setDetail] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [status, setStatus] = useState<OrderStatus>('waiting')
  const [isSaving, setIsSaving] = useState(false)

  // เปิดกล่อง → ใส่ข้อมูลเดิม
  useEffect(() => {
    if (!isOpen) return
    setCustomerName(order?.customerName ?? '')
    setDetail(order?.detail ?? '')
    setTotalPrice(order ? String(order.totalPrice) : '')
    setStatus(order?.status ?? 'waiting')
  }, [isOpen, order])

  const canSave = Boolean(customerName.trim() || detail.trim())

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!canSave) return
    setIsSaving(true)
    const orderData = { customerName: customerName.trim(), detail: detail.trim(), totalPrice: toNumber(totalPrice), status }
    try {
      if (order) await saveOrder(order.id, orderData)
      else await addOrder(orderData)
      showMessage(order ? 'บันทึกแล้ว' : 'เพิ่มออเดอร์แล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function moveToTrash() {
    if (!order) return
    try {
      await moveOrderToTrash(order.id)
      showMessage('ย้ายไปถังขยะแล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={order ? 'แก้ไขออเดอร์' : 'เพิ่มออเดอร์'} onClose={onClose}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="small-label">ชื่อลูกค้า</span>
            <input className="text-input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} autoFocus maxLength={200} />
          </label>
          <label className="flex w-32 flex-col gap-1.5">
            <span className="small-label">ยอดรวม (บาท)</span>
            <input className="text-input" inputMode="decimal" value={totalPrice} onChange={(event) => setTotalPrice(event.target.value)} placeholder="0" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="small-label">รายละเอียด (สินค้า / ที่อยู่ / เบอร์โทร)</span>
          <textarea className="text-input min-h-[110px] resize-y" value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>
        <div>
          <p className="small-label mb-1.5">สถานะ</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ORDER_STATUS_INFO) as OrderStatus[]).map((oneStatus) => (
              <TagButton key={oneStatus} emoji={ORDER_STATUS_INFO[oneStatus].emoji} isSelected={status === oneStatus} onClick={() => setStatus(oneStatus)}>
                {ORDER_STATUS_INFO[oneStatus].name}
              </TagButton>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {order && (
            <RoundButton look="danger" size="small" onClick={moveToTrash}>
              ลบออเดอร์
            </RoundButton>
          )}
          <div className="flex-1" />
          <RoundButton look="ghost" onClick={onClose}>
            ยกเลิก
          </RoundButton>
          <RoundButton look="main" type="submit" disabled={isSaving || !canSave}>
            {order ? 'บันทึก' : 'เพิ่ม'}
          </RoundButton>
        </div>
      </form>
    </PopupBox>
  )
}
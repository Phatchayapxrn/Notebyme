// =====================================================================
// ProductEditBox : กล่องเด้ง เพิ่ม / แก้ไข สินค้า (ชื่อ / ราคา / จำนวน / หมายเหตุ)
// ใช้งาน:
//   <ProductEditBox isOpen={...} product={สินค้าที่จะแก้ หรือ null = เพิ่มใหม่} onClose={...} />
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addProduct, moveProductToTrash, saveProduct } from '../../database'
import { toNumber, type Product } from '../../types'

interface ProductEditBoxProps {
  isOpen: boolean
  /** null = เพิ่มสินค้าใหม่ */
  product: Product | null
  onClose: () => void
}

export function ProductEditBox({ isOpen, product, onClose }: ProductEditBoxProps) {
  const showMessage = useShowMessage()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // เปิดกล่อง → ใส่ข้อมูลเดิม
  useEffect(() => {
    if (!isOpen) return
    setName(product?.name ?? '')
    setPrice(product ? String(product.price) : '')
    setStock(product ? String(product.stock) : '')
    setNote(product?.note ?? '')
  }, [isOpen, product])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    const productData = { name: name.trim(), price: toNumber(price), stock: Math.round(toNumber(stock)), note: note.trim() }
    try {
      if (product) await saveProduct(product.id, productData)
      else await addProduct(productData)
      showMessage(product ? 'บันทึกแล้ว' : `เพิ่ม "${productData.name}" แล้ว`)
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function moveToTrash() {
    if (!product) return
    try {
      await moveProductToTrash(product.id)
      showMessage('ย้ายไปถังขยะแล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'} onClose={onClose}>
      <form onSubmit={save} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="small-label">ชื่อสินค้า</span>
          <input className="text-input" value={name} onChange={(event) => setName(event.target.value)} autoFocus maxLength={200} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="small-label">ราคา (บาท)</span>
            <input className="text-input" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="small-label">จำนวนในสต็อก</span>
            <input className="text-input" inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} placeholder="0" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="small-label">หมายเหตุ (สี / ไซซ์ / อื่นๆ)</span>
          <textarea className="text-input min-h-[70px] resize-y" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <div className="mt-2 flex items-center gap-2">
          {product && (
            <RoundButton look="danger" size="small" onClick={moveToTrash}>
              ลบสินค้า
            </RoundButton>
          )}
          <div className="flex-1" />
          <RoundButton look="ghost" onClick={onClose}>
            ยกเลิก
          </RoundButton>
          <RoundButton look="main" type="submit" disabled={isSaving || !name.trim()}>
            {product ? 'บันทึก' : 'เพิ่ม'}
          </RoundButton>
        </div>
      </form>
    </PopupBox>
  )
}
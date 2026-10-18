// =====================================================================
// ProductsTab : แท็บ "สินค้า" ในหน้าร้าน
//   - ค้นหาสินค้า / ปุ่มเพิ่มสินค้า
//   - แต่ละแถว: ชื่อ + หมายเหตุ / ราคา / ปุ่ม - + ปรับจำนวนในสต็อก
//   - เหลือน้อย (LOW_STOCK_NUMBER) = ป้าย "ใกล้หมด", เหลือ 0 = "หมด"
//   - กดที่ชื่อสินค้า = แก้ไข / ลบ
// =====================================================================
import { useMemo, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { RoundButton } from '@/shared/parts/RoundButton'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { PRODUCTS_TABLE, getAllProducts, saveProduct } from '../../database'
import { LOW_STOCK_NUMBER, showMoney, type Product } from '../../types'
import { ProductEditBox } from './ProductEditBox'

export function ProductsTab() {
  const showMessage = useShowMessage()
  const { items: products, isLoading } = useLiveList({ tableName: PRODUCTS_TABLE, getList: getAllProducts })
  const [searchText, setSearchText] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false)

  const shownProducts = useMemo(() => {
    const word = searchText.trim().toLowerCase()
    if (!word) return products
    return products.filter((product) => `${product.name} ${product.note}`.toLowerCase().includes(word))
  }, [products, searchText])

  const lowStockCount = products.filter((product) => product.stock <= LOW_STOCK_NUMBER).length

  function openEditBox(product: Product | null) {
    setEditingProduct(product)
    setIsEditBoxOpen(true)
  }

  /** ปรับจำนวนในสต็อก +1 / -1 */
  async function changeStock(product: Product, change: number) {
    const newStock = Math.max(0, product.stock + change)
    if (newStock === product.stock) return
    try {
      await saveProduct(product.id, { stock: newStock })
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    }
  }

  if (isLoading) return <LoadingDots />

  return (
    <div className="flex flex-col gap-4">
      {/* แถวบน */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[180px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" aria-hidden="true" />
          <input
            className="text-input py-2.5 pl-10"
            placeholder="ค้นหาสินค้า"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="ค้นหาสินค้า"
          />
        </label>
        <RoundButton look="main" icon={<Plus size={17} />} onClick={() => openEditBox(null)}>
          เพิ่มสินค้า
        </RoundButton>
      </div>
      <p className="font-typewriter text-sm text-soft">
        ทั้งหมด {products.length} รายการ{lowStockCount > 0 && <span className="text-rose"> · ใกล้หมด/หมด {lowStockCount} รายการ</span>}
      </p>

      {/* รายการสินค้า */}
      {shownProducts.length === 0 ? (
        <EmptyMessage
          emoji="📦"
          title={products.length === 0 ? 'ยังไม่มีสินค้า' : 'ไม่เจอสินค้าที่ค้นหา'}
          text={products.length === 0 ? 'กด "เพิ่มสินค้า" เพื่อใส่ชื่อ ราคา และจำนวนในสต็อก' : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {shownProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-pop">
              <button type="button" onClick={() => openEditBox(product)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-[16px] text-ink">
                  {product.name}
                  {product.stock <= 0 ? (
                    <span className="ml-2 rounded-md bg-danger/15 px-1.5 py-0.5 text-xs text-danger">หมด</span>
                  ) : (
                    product.stock <= LOW_STOCK_NUMBER && <span className="ml-2 rounded-md bg-rose/15 px-1.5 py-0.5 text-xs text-rose">ใกล้หมด</span>
                  )}
                </p>
                <p className="truncate text-sm text-soft">
                  {showMoney(product.price)}
                  {product.note && ` · ${product.note.split('\n')[0]}`}
                </p>
              </button>
              {/* ปรับจำนวน */}
              <div className="flex flex-none items-center gap-1 rounded-full border border-line p-0.5">
                <button
                  type="button"
                  aria-label={`ลดจำนวน ${product.name}`}
                  onClick={() => changeStock(product, -1)}
                  className="grid h-8 w-8 place-items-center rounded-full text-soft hover:bg-blush hover:text-ink"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-[2.5ch] text-center font-typewriter text-[15px] text-ink" aria-label="จำนวนในสต็อก">
                  {product.stock}
                </span>
                <button
                  type="button"
                  aria-label={`เพิ่มจำนวน ${product.name}`}
                  onClick={() => changeStock(product, 1)}
                  className="grid h-8 w-8 place-items-center rounded-full text-soft hover:bg-blush hover:text-ink"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductEditBox isOpen={isEditBoxOpen} product={editingProduct} onClose={() => setIsEditBoxOpen(false)} />
    </div>
  )
}
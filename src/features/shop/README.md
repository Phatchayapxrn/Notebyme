# ระบบ "ร้าน" (shop)

หน้าจัดการร้าน แบ่งเป็น 3 แท็บ

| ลิงก์ | หน้า |
|---|---|
| `/shop` หรือ `/shop?tab=messages` | **ชุดข้อความ** : วางข้อความเก็บไว้ กดคัดลอกไปใช้ (เช่น ข้อความตอบลูกค้า / แคปชันโพสต์ขายของ) |
| `/shop?tab=products` | **สินค้า** : ชื่อ ราคา จำนวนในสต็อก (กด - / + ปรับจำนวน) |
| `/shop?tab=orders` | **ออเดอร์** : ชื่อลูกค้า รายละเอียด ยอดรวม สถานะ (รอโอน → โอนแล้ว รอส่ง → ส่งแล้ว) |

## ชุดข้อความ ทำอะไรได้บ้าง
- **วางข้อความ 1 ครั้ง = ได้ 1 ชุด** : วางในช่องเส้นประด้านล่างสุด ระบบสร้างชุดใหม่ให้ทันที (นับเป็น ชุดที่ 1, 2, 3 ...)
- **ปุ่มคัดลอกมุมขวาบน** ของแต่ละชุด = คัดลอกข้อความทั้งชุด / ปุ่ม "คัดลอกทุกชุด" ด้านบน = คัดลอกทุกชุดต่อกัน
- **แก้ข้อความได้เลย** บันทึกเองอัตโนมัติ
- **ฟอนต์** : เลือกข้อความบางส่วนไว้ แล้วกด "ฟอนต์" = เปลี่ยนเฉพาะส่วนนั้น / ไม่ได้เลือก = เปลี่ยนทั้งชุด
  (ฟอนต์พิเศษเป็นตัวอักษร Unicode คัดลอกไปวางใน Facebook / IG / LINE ได้ แต่มีแค่ตัวอังกฤษและตัวเลข)
- **อีโมจิ / อิโมติคอน / เส้นคั่น** : กดหน้ายิ้ม แล้วเลือก จะใส่ตรงตำแหน่งที่พิมพ์อยู่
- **บรรทัดว่างไม่เยอะเกิน** : ตอนวางและตอนคัดลอก ระบบยุบบรรทัดว่างที่ซ้อนกันหลายบรรทัดให้เหลือ 1 บรรทัด (`cleanText` ใน `src/shared/text/copyText.ts`)

## ไฟล์

| ไฟล์ | ทำอะไร |
|---|---|
| `feature.tsx` | ข้อมูลระบบ: เมนู "ร้าน", การ์ดหน้าแรก, ถังขยะ, สำรองข้อมูล |
| `types.ts` | `ShopMessage`, `Product`, `Order`, `OrderStatus` + `ORDER_STATUS_INFO` (ชื่อไทย/สี/ขั้นถัดไป), `LOW_STOCK_NUMBER`, `showMoney`, `toNumber` |
| `database.ts` | ฟังก์ชันอ่าน/เขียนของทั้ง 3 ตาราง + ถังขยะรวม (`getShopTrashItems`, `bringShopItemBack`, `deleteShopItemForever`) |
| `pages/ShopPage.tsx` | หน้าหลัก + แท็บ |
| `parts/messages/MessageSetsTab.tsx` | แท็บชุดข้อความ: รายการชุด + ช่องวางข้อความเพิ่มชุดใหม่ + คัดลอกทุกชุด |
| `parts/messages/MessageSetBox.tsx` | ชุดข้อความ 1 ชุด: ปุ่มคัดลอก, แก้ข้อความ, ฟอนต์, อีโมจิ, เลื่อนขึ้น/ลง, ลบ |
| `parts/products/ProductsTab.tsx` | แท็บสินค้า: ค้นหา, รายการ, ปรับจำนวน |
| `parts/products/ProductEditBox.tsx` | กล่องเด้ง เพิ่ม/แก้/ลบ สินค้า |
| `parts/orders/OrdersTab.tsx` | แท็บออเดอร์: สรุปยอด, กรองสถานะ, รายการ |
| `parts/orders/OrderEditBox.tsx` | กล่องเด้ง เพิ่ม/แก้/ลบ ออเดอร์ |
| `parts/ShopHomeCard.tsx` | ในหน้าแรก: จำนวนรอโอน / รอส่ง / สินค้าใกล้หมด |

ชิ้นส่วนที่ใช้ร่วมกับระบบอื่นได้ (อยู่ใน `src/shared/`):
`parts/CopyButton.tsx`, `parts/EmojiButton.tsx`, `parts/FancyFontButton.tsx`, `text/copyText.ts`, `text/fancyLetters.ts`, `text/insertText.ts`

## ตารางในฐานข้อมูล
`shop_messages`, `shop_products`, `shop_orders` (สร้างด้วย `supabase/sql/003_future_and_shop.sql`) ดูรายละเอียดใน `docs/03-database.md`

## อยากแก้...
| อยาก | แก้ที่ |
|---|---|
| ชื่อ/สีสถานะออเดอร์ | `ORDER_STATUS_INFO` ใน `types.ts` |
| จำนวนที่ถือว่า "ใกล้หมด" (ตอนนี้ 3) | `LOW_STOCK_NUMBER` ใน `types.ts` |
| เพิ่มอีโมจิ / อิโมติคอน | `EMOJI_GROUPS` ใน `src/shared/parts/EmojiButton.tsx` |
| เพิ่ม/ลด ฟอนต์พิเศษ | `FANCY_STYLES` ใน `src/shared/text/fancyLetters.ts` |
| ระยะบรรทัดตอนคัดลอก | `cleanText` ใน `src/shared/text/copyText.ts` |
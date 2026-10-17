# 02 · ดีไซน์ (สี ฟอนต์ ชิ้นส่วนหน้าจอ)

ดีไซน์อ้างอิงจากรูปในโฟลเดอร์ `ideapic/` โทน **ชมพู-ครีม + มารูนเข้ม** กล่องแบบ **หน้าต่างคอมย้อนยุค** (มีจุด ●○○)

---

## 🎨 สี

สีทั้งหมดอยู่ที่ **`src/index.css`** ส่วน `:root` (แก้ที่เดียว เปลี่ยนทั้งเว็บ)

| ชื่อใน class | ค่าสี | ใช้กับ |
|---|---|---|
| `cream` | `#FFF8F4` | พื้นหลังเว็บ |
| `paper` | `#FFFFFF` | พื้นกล่อง / การ์ด |
| `blush` | `#FBE4E8` | ชมพูอ่อน (แถบหัวกล่อง ปุ่มชมพู) |
| `pink` | `#F2BFC8` | ชมพูกลาง (ขอบตอนเอาเมาส์ชี้ วงกลมติ๊ก) |
| `rose` | `#D98A9A` | ชมพูเข้ม (วงกลม % ตัวหนังสือน่ารัก) |
| `wine` | `#3B1E24` | **สีหลัก** มารูนเข้ม (ปุ่มหลัก ปุ่มที่เลือกอยู่ หัวข้อ) |
| `ink` | `#3B2A2E` | ตัวหนังสือปกติ |
| `soft` | `#7F6A72` | ตัวหนังสือรอง (จางกว่า) |
| `line` | `#EBCDD3` | เส้นขอบ |
| `danger` | `#C2475E` | สีเตือน / ปุ่มลบ |

### วิธีใช้ใน class
```tsx
<div className="bg-blush text-wine border-line">        // พื้นชมพูอ่อน ตัวหนังสือมารูน ขอบชมพู
<div className="bg-wine/50">                             // มารูน โปร่งใส 50%
```

### วิธีเปลี่ยนสี
ใน `src/index.css` ค่าสีเขียนเป็นเลข **R G B** (ไม่มีลูกน้ำ ไม่มี #) เช่น
```css
--color-wine: 59 30 36; /* #3B1E24 */
```
อยากได้สีใหม่ เช่น `#2E3A59` → แปลงเป็น RGB ได้ `46 58 89` → ใส่แทน
(แปลงสีได้ที่ Google ค้นคำว่า "hex to rgb")

---

## 🔤 ฟอนต์

| ชื่อใน class | ฟอนต์ | ใช้กับ |
|---|---|---|
| `font-title` | Playfair Display (อังกฤษ) + Mali (ไทย) | หัวข้อใหญ่ "ไอเดีย." |
| `font-cute` | Mali | ชื่อการ์ด ข้อความน่ารัก |
| `font-typewriter` | IBM Plex Mono | วันที่ ตัวเลข ชื่อกล่อง `ideas.exe` |
| `font-body` | IBM Plex Sans Thai Looped | ข้อความทั่วไป (ค่าเริ่มต้น) |

**เปลี่ยนฟอนต์:** แก้ 2 ที่
1. `index.html` ลิงก์ Google Fonts (เลือกฟอนต์ที่ https://fonts.google.com แล้วคัดลอกลิงก์มา)
2. `tailwind.config.ts` ส่วน `fontFamily`

> 💡 ภาษาไทยมีสระ/วรรณยุกต์ด้านบน ถ้าตั้งระยะห่างตัวอักษร (letter-spacing) กว้างเกินไป จะอ่านยาก
> คลาส `.small-label` จึงใช้ระยะห่างนิดเดียว ส่วนป้ายภาษาอังกฤษ (เช่น "IDEAS") ใช้ `tracking-label` ที่ห่างกว่า

---

## 🧩 ชิ้นส่วนหน้าจอ (`src/shared/parts/`)

ใช้ซ้ำได้ทุกหน้า **แก้ที่ไฟล์เดียว เปลี่ยนทุกที่**

### `WindowBox` : กล่องหน้าต่างย้อนยุค
```tsx
<WindowBox title="ideas.exe">เนื้อหา</WindowBox>
<WindowBox title="..." rightSide={<ปุ่ม />} insideClassName="p-0">...</WindowBox>
```

### `RoundButton` : ปุ่มแคปซูล
```tsx
<RoundButton look="main" onClick={...}>บันทึก</RoundButton>
<RoundButton look="pink" size="small" icon={<Plus size={16} />}>เพิ่ม</RoundButton>
```
| look | หน้าตา |
|---|---|
| `main` | พื้นมารูน ตัวขาว (ปุ่มหลัก) |
| `pink` | พื้นชมพู มีเงาเลื่อน |
| `plain` | พื้นขาว ขอบชมพู (ค่าเริ่มต้น) |
| `danger` | ปุ่มลบ สีแดง |
| `ghost` | ไม่มีพื้น |

size: `small` / `normal` / `big`

### `IconButton` : ปุ่มไอคอนกลม (ต้องใส่ `label` บอกว่าปุ่มทำอะไร)
```tsx
<IconButton label="ปักหมุด" onClick={...}><Pin size={18} /></IconButton>
```

### `TagButton` + `TagRow` : ป้ายเลือกหมวด / ตัวกรอง
```tsx
<TagRow>
  <TagButton isSelected={x === 'all'} onClick={...}>ทั้งหมด</TagButton>
  <TagButton emoji="📚" look="flat">เรียน</TagButton>
</TagRow>
```

### `PageTitle` : หัวข้อใหญ่ของหน้า
```tsx
<PageTitle smallLabel="IDEAS" title="ไอเดีย." underText="จดไว้ก่อน" rightSide={<ปุ่ม />} />
```

### `DonePercentCircle` : วงกลม % งานที่เสร็จ
```tsx
<DonePercentCircle doneCount={2} allCount={5} size={150} />
```

### `Tabs` : แท็บแบบแฟ้ม
```tsx
<Tabs tabList={[{ id: 'all', name: 'ทั้งหมด', count: 3 }]} selectedId={tab} onSelect={setTab} />
```

### `PopupBox` / `ConfirmBox` : กล่องเด้งกลางจอ
```tsx
<PopupBox isOpen={isOpen} title="แก้ไข" onClose={close}>ฟอร์ม</PopupBox>
<ConfirmBox isOpen={...} title="ลบ?" text="กู้คืนไม่ได้" confirmText="ลบเลย" isDanger onConfirm={...} onClose={...} />
```

### `useShowMessage` : ข้อความเด้งด้านล่าง แล้วหายเอง
```tsx
const showMessage = useShowMessage()
showMessage('บันทึกแล้ว')
showMessage('มีปัญหา', 'error')
```

### อื่นๆ
| ชิ้นส่วน | ใช้ทำอะไร |
|---|---|
| `EmptyMessage` | ข้อความตอนไม่มีข้อมูล (`emoji`, `title`, `text`) |
| `LoadingDots` | จุดกระพริบระหว่างโหลด |
| `SaveStatusText` | สถานะการบันทึก ("บันทึกแล้ว", "กำลังบันทึก...") |

---

## 📐 ขนาดจอ (responsive)

| ขนาดจอ | หน้าตา |
|---|---|
| < 768px (มือถือ) | หัวเว็บ "Idea." ด้านบน + เมนูไอคอนด้านล่าง |
| ≥ 768px (แท็บเล็ต/คอม) | เมนูไอคอนด้านซ้าย |
| ≥ 1280px (จอกว้าง) | เพิ่มแถบสรุปด้านขวา (งาน + วงกลม %) |

ใน Tailwind: ไม่มีคำนำหน้า = มือถือ, `sm:` ≥ 640px, `md:` ≥ 768px, `lg:` ≥ 1024px, `xl:` ≥ 1280px
เช่น `hidden md:flex` = ซ่อนในมือถือ แสดงตั้งแต่จอ 768px

---

## 🖼️ ลายปกการ์ดหมวดหมู่
อยู่ที่ `public/patterns/*.svg` (hearts, plaid, dots, diamonds, stripes, flowers)
- ลายเป็นสีขาวโปร่งใส วางทับบน "สีประจำหมวด" จึงเปลี่ยนสีตามหมวดได้
- **เพิ่มลายใหม่:** วางไฟล์ `.svg` ใหม่ใน `public/patterns/` แล้วเพิ่มชื่อใน `COVER_PATTERNS` (ไฟล์ `src/shared/groups/groupTypes.ts`)

## 🌙 ธีมมืด (ทำเพิ่มได้ในอนาคต)
ทุกสีเป็นตัวแปร CSS แล้ว ถ้าจะทำธีมมืด แค่เพิ่มใน `src/index.css`
```css
@media (prefers-color-scheme: dark) {
  :root { --color-cream: 30 20 24; --color-paper: 45 32 37; --color-ink: 250 235 238; /* ...สีอื่นๆ */ }
}
```

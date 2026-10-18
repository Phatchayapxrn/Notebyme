# 02 · ดีไซน์ (สี ฟอนต์ ชิ้นส่วนหน้าจอ)

ดีไซน์ตอนนี้เป็นโทน **ขาว-เทา สะอาดตา** มีสีชมพู (`rose`) เป็นสีเน้นนิดหน่อย และมี **โหมดมืด**
กล่องยังเป็นแบบหน้าต่าง (มีจุดเล็กๆ 3 จุด) แต่เรียบขึ้น
(เดิมเป็นโทนชมพู-ครีม + มารูนเข้ม ตามรูปใน `ideapic/` ชื่อสีในโค้ดยังเป็นชื่อเดิม เพื่อไม่ต้องแก้ทุกไฟล์)

---

## 🎨 สี

สีทั้งหมดอยู่ที่ **`src/index.css`** (แก้ที่เดียว เปลี่ยนทั้งเว็บ)
- ส่วน `:root` = สี **โหมดสว่าง**
- ส่วน `:root[data-theme='dark']` = สี **โหมดมืด**

| ชื่อใน class | โหมดสว่าง | โหมดมืด | ใช้กับ |
|---|---|---|---|
| `cream` | `#F7F7F8` | `#111114` | พื้นหลังเว็บ |
| `paper` | `#FFFFFF` | `#1B1B1F` | พื้นกล่อง / การ์ด |
| `blush` | `#F1F1F4` | `#26262C` | พื้นอ่อน (แถบหัวกล่อง ตอนเอาเมาส์ชี้) |
| `pink` | `#D6D6DD` | `#484852` | สีกลาง (วงกลมติ๊ก จุดโหลด ตัวหนังสือจางๆ) |
| `rose` | `#DB708A` | `#EC859E` | **สีเน้น** ชมพู (วงกลม % แถบอัปโหลด ป้าย "ใหม่") |
| `wine` | `#1C1C21` | `#EEEEF2` | **สีหลัก** (ปุ่มหลัก ปุ่มที่เลือกอยู่ หัวข้อ) — โหมดมืดกลับเป็นสีอ่อน |
| `ink` | `#212126` | `#E8E8ED` | ตัวหนังสือปกติ |
| `soft` | `#70707A` | `#9898A4` | ตัวหนังสือรอง (จางกว่า) |
| `line` | `#E5E5EA` | `#303037` | เส้นขอบ |
| `danger` | `#D63C54` | `#F4687C` | สีเตือน / ปุ่มลบ |
| (`--color-shadow`) | | | สีเงา ใช้ใน `tailwind.config.ts` ส่วน `boxShadow` |

> ⚠️ อย่าใส่สีตรงๆ เช่น `bg-white` / `text-black` ในหน้าจอ ให้ใช้ชื่อสีด้านบน
> ไม่งั้นโหมดมืดจะได้กล่องขาวจ้า (ยกเว้นพื้นหลังมืดของกล่องเด้ง `bg-black/40` ที่ตั้งใจให้มืดทั้ง 2 โหมด)

### 🌙 โหมดมืด
- ปุ่มพระจันทร์/พระอาทิตย์ : มุมขวาบน (มือถือ) / ล่างสุดของเมนูซ้าย (จอคอม)
- หน้าตั้งค่า > **โหมดสี** : เลือก สว่าง / มืด / ตามเครื่อง (ค่าเริ่มต้น = ตามเครื่อง)
- โค้ดอยู่ที่ `src/shared/theme/themeTools.ts` (จำค่าที่เลือกไว้ในเครื่อง ชื่อ `theme`)
  และ `src/shared/theme/ThemeButton.tsx` (ปุ่ม `ThemeButton` + แถวเลือก `ThemePicker`)
- `index.html` มีสคริปต์สั้นๆ ใส่สีก่อนเว็บโหลด กันจอขาวแวบตอนเปิดในโหมดมืด

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

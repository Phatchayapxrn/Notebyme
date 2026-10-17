# 05 · รูปภาพและวิดีโอ

## ใส่รูป/วิดีโอในไอเดียได้ 3 วิธี
1. กดปุ่ม 📷 (รูป) หรือ 🎬 (วิดีโอ) ในแถบเครื่องมือของ editor
2. **วาง** (Ctrl+V / Cmd+V) รูปที่คัดลอกไว้
3. **ลากไฟล์** มาวางในช่องเขียน

เลือกรูปพร้อมกันหลายรูปได้ / กดที่รูปแล้วจะมีปุ่ม "เอารูปออก"

---

## ขั้นตอนเบื้องหลัง

```
เลือกไฟล์
  ↓
useUploadFile.uploadOneFile(file)          src/shared/files/useUploadFile.ts
  ↓  รูป → uploadPicture / วิดีโอ → uploadVideo
fileStorage.ts                             src/shared/files/fileStorage.ts
  ├ รูป: ย่อด้วย shrinkPicture (ด้านยาวสุด 2000px, ~1.5MB) เพื่อประหยัดพื้นที่
  ├ วิดีโอ: เช็คขนาดไม่เกิน 50MB
  ├ อัปโหลดไปที่ Storage ถัง "user-files"
  │    path = {user_id}/{ประเภท}/{id เจ้าของ}/{ชื่อสุ่ม}.jpg
  └ จดลงตาราง files (ของใคร ขนาดเท่าไหร่)
  ↓
NoteEditor ใส่บล็อก picture / video ลงในเนื้อหา   src/features/notes/parts/editor/
  (ในเนื้อหาเก็บแค่ "path" ไม่ได้เก็บลิงก์)
  ↓
ตอนแสดง: PictureBlock / VideoBlock เรียก useFileLink(path)
  → getFileLink ขอ "ลิงก์ชั่วคราว" (อายุ 6 ชม.) จาก Supabase → แสดงรูป
```

### ทำไมเก็บ path แทนลิงก์?
ถังเก็บไฟล์เป็นแบบ **ส่วนตัว** (คนอื่นเปิดไม่ได้) ลิงก์เปิดไฟล์จึงเป็นแบบ **หมดอายุได้**
ถ้าเก็บลิงก์ไว้ในโน๊ต วันหลังจะเปิดไม่ได้ เลยเก็บ path แล้วขอลิงก์ใหม่ทุกครั้งที่แสดง
(ลิงก์ที่ขอแล้วจะถูกจำไว้ใน `savedLinks` ไม่ขอซ้ำจนกว่าจะใกล้หมดอายุ)

---

## การลบไฟล์ (ไม่ให้มีไฟล์ขยะค้าง)

| เหตุการณ์ | เกิดอะไรขึ้น | โค้ด |
|---|---|---|
| เอารูปออกจากโน๊ต | ยังไม่ลบทันที (เผื่อกด "ย้อนกลับ") ลบตอน **ออกจากหน้าแก้ไข** | `deleteUnusedFiles` ใน `NoteEditPage.tsx` |
| ย้ายโน๊ตไปถังขยะ | ไฟล์ยังอยู่ (กู้คืนได้) | |
| ลบโน๊ตถาวร / ครบ 30 วัน | ลบไฟล์ทั้งหมดของโน๊ตนั้น | `deleteAllFilesOf` ใน `notes/database.ts` |
| เปลี่ยนภาพปกหมวด | ลบรูปปกเก่า | `GroupEditBox.tsx` |
| ลบหมวด | ลบรูปปกที่อัปโหลด | `deleteGroup` |

---

## ข้อจำกัด (Supabase แบบฟรี)

| | ขีดจำกัด | ตั้งค่าที่ |
|---|---|---|
| ขนาดวิดีโอต่อไฟล์ | 50MB | `BIGGEST_VIDEO_SIZE` ใน `fileStorage.ts` + `file_size_limit` ใน `002_files.sql` |
| ขนาดรูปก่อนย่อ | 30MB | `BIGGEST_PICTURE_SIZE` |
| พื้นที่รวม | 1GB | ดูที่ใช้ไปได้ในหน้า **ตั้งค่า** |

> 💡 วิดีโอยาวๆ ใหญ่มาก แนะนำอัปโหลดคลิปสั้น หรืออัปขึ้น YouTube แล้วแปะลิงก์แทน
> ถ้าพื้นที่ไม่พอ อัปเกรด Supabase เป็นแบบ Pro ได้ (100GB)

### ปรับขนาดย่อรูป
แก้ใน `shrinkPicture` (`src/shared/files/fileStorage.ts`)
```ts
maxWidthOrHeight: 2000,  // ด้านยาวสุด (px)
maxSizeMB: 1.5,          // ขนาดไฟล์สูงสุดหลังย่อ
```

---

## ใช้กับระบบอื่น (ระบบใหม่ในอนาคต)
```tsx
const { uploadOneFile, isUploading } = useUploadFile({ belongsToType: 'diary', belongsToId: diaryId })
const result = await uploadOneFile(file)   // ได้ { filePath, fileType, width, height } หรือ null ถ้าพลาด
const { link } = useFileLink(result.filePath)  // เอาไปใส่ <img src={link}>
```
อย่าลืมเรียก `deleteAllFilesOf({ belongsToType: 'diary', belongsToId })` ตอนลบถาวร

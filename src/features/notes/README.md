# ระบบ "ไอเดีย" (notes)

จดไอเดีย แยกหมวด ใส่รูป/วิดีโอ ปักหมุด ค้นหา

| ลิงก์ | หน้า |
|---|---|
| `/notes` | รวมไอเดียทั้งหมด (`?group=id` = ดูเฉพาะหมวด, `?group=none` = ไม่มีหมวด) |
| `/notes/:noteId` | เขียน / แก้ไขไอเดีย |

## ไฟล์

| ไฟล์ | ทำอะไร |
|---|---|
| `feature.tsx` | ข้อมูลระบบ: เมนู "ไอเดีย", หน้าต่างๆ, การ์ดหน้าแรก, ถังขยะ, สำรองข้อมูล |
| `types.ts` | `NoteSummary` (แบบย่อ ใช้ในรายการ), `Note` (แบบเต็ม), `NoteChanges` (ข้อมูลที่บันทึก) |
| `database.ts` | `getAllNotes`, `getOneNote`, `addNewNote`, `saveNote`, `pinNote`, `moveNoteToTrash`, `bringNoteBack`, `deleteNoteForever`, `getNotesInTrash`, `getAllNotesForBackup` |
| `pages/NotesPage.tsx` | หน้ารวม: ค้นหา, กรองหมวด, สลับแบบการ์ด/แถว, ปักหมุดอยู่บน, ปุ่ม + |
| `pages/NoteEditPage.tsx` | หน้าแก้ไข: หมวด, หัวข้อ, เนื้อหา, ปุ่มบันทึก (Ctrl+S), ปักหมุด, ลบ, บันทึกอัตโนมัติ |
| `parts/NoteCard.tsx` | การ์ดไอเดีย 1 อัน (แบบ `grid` = การ์ด, `list` = แถว) |
| `parts/NotesHomeCard.tsx` | ส่วนในหน้าแรก: การ์ดหมวดหมู่ + ไอเดียล่าสุด |
| `parts/editor/NoteEditor.tsx` | ช่องเขียน (TipTap) + วางรูป / ลากไฟล์มาใส่ |
| `parts/editor/EditorToolbar.tsx` | แถบปุ่ม: ตัวหนา เอียง หัวข้อ รายการ เช็คลิสต์ อ้างอิง รูป วิดีโอ ย้อนกลับ |
| `parts/editor/PictureBlock.tsx` | บล็อกรูปในเนื้อหา (เก็บ path แล้วขอลิงก์ตอนแสดง) |
| `parts/editor/VideoBlock.tsx` | บล็อกวิดีโอในเนื้อหา |
| `parts/editor/contentTools.ts` | `getFilePathsInContent` (หาไฟล์ทั้งหมดในเนื้อหา), `getFirstPicture` (หารูปแรก) |

## เรื่องที่ควรรู้
- **กด + สร้างไอเดียใหม่** จะสร้างแถวเปล่าในฐานข้อมูลทันที แล้วเปิดหน้าแก้ไข
  ถ้าออกจากหน้าโดยไม่พิมพ์อะไรเลย จะลบทิ้งให้อัตโนมัติ (ไม่มีไอเดียเปล่าค้าง)
- **ตอนออกจากหน้าแก้ไข** จะลบไฟล์รูป/วิดีโอที่เอาออกจากเนื้อหาไปแล้ว
- ค้นหาทำในเครื่อง (กรองจาก `title` + `plain_text`) ไม่ต้องรอเน็ต
- แบบการแสดง (การ์ด/แถว) จำไว้ในเครื่อง (`localStorage` ชื่อ `notes-view-look`)

## อยากแก้...
| อยาก | แก้ที่ |
|---|---|
| เพิ่มปุ่มในแถบเครื่องมือ (เช่น ขีดเส้นใต้) | `EditorToolbar.tsx` (+ ติดตั้ง extension ของ TipTap แล้วใส่ใน `NoteEditor.tsx`) |
| ข้อความจางๆ ในช่องเขียน | `Placeholder.configure(...)` ใน `NoteEditor.tsx` |
| หน้าตาเนื้อหา (ขนาดตัวหนังสือ หัวข้อ) | `.note-content` ใน `src/index.css` |
| จำนวนไอเดียล่าสุดในหน้าแรก | `notes.slice(0, 6)` ใน `NotesHomeCard.tsx` |
| เวลารอก่อนบันทึกอัตโนมัติ | `waitTime` ใน `useAutoSave` (`NoteEditPage.tsx`) |

# 07 · พจนานุกรมคำในโค้ด (อังกฤษ → ไทย)

## กฎการตั้งชื่อในโปรเจกต์นี้
1. **ใช้คำอังกฤษง่ายๆ** เช่น get, save, delete, show, box, button, menu
2. **ไม่ใช้คำย่อ / ศัพท์เทคนิค** เช่น ~~btn~~ ~~ctx~~ ~~util~~ ~~purge~~ ~~flush~~
3. **ฟังก์ชัน = กริยา + สิ่งของ** เช่น `moveNoteToTrash` = ย้าย-โน๊ต-ไป-ถังขยะ
4. **true/false ขึ้นต้นด้วย `is` / `has`** เช่น `isDone` = เสร็จแล้วไหม
5. **ชิ้นส่วนหน้าจอ = ชื่อสิ่งที่เห็น** เช่น `BottomMenu` = เมนูด้านล่าง
6. **ทุกไฟล์/ฟังก์ชัน มีคอมเมนต์ภาษาไทยด้านบน**

### อ่านชื่อยาวๆ ยังไง
ชื่อในโค้ดเขียนติดกัน ตัวใหญ่ = เริ่มคำใหม่
`getAllNotes` → get · All · Notes → **ดึง · ทั้งหมด · โน๊ต**
`isMovedToTrash` → is · Moved · To · Trash → **ถูกย้าย · ไป · ถังขยะ · แล้วไหม**

---

## คำกริยา (ใช้ขึ้นต้นชื่อฟังก์ชัน)

| คำ | แปลว่า | ตัวอย่าง |
|---|---|---|
| get | ดึง / เอามา | `getAllNotes` ดึงโน๊ตทั้งหมด |
| add | เพิ่ม | `addNewTask` เพิ่มงานใหม่ |
| save | บันทึก | `saveNote` บันทึกโน๊ต |
| delete | ลบ | `deleteFile` ลบไฟล์ |
| move | ย้าย | `moveNoteToTrash` ย้ายโน๊ตไปถังขยะ |
| bring back | เอากลับมา / กู้คืน | `bringNoteBack` กู้โน๊ตคืน |
| show | แสดง | `showMessage` แสดงข้อความเด้ง |
| upload | อัปโหลด | `uploadPicture` อัปโหลดรูป |
| shrink | ย่อ | `shrinkPicture` ย่อรูป |
| mark | ทำเครื่องหมาย | `markTaskDone` ติ๊กว่างานเสร็จ |
| pin | ปักหมุด | `pinNote` |
| find | หา | `findGroup` หาหมวดจาก id |
| change | เปลี่ยน | `changeNote` เปลี่ยนข้อมูลโน๊ต |
| load | โหลด | `loadAgain` โหลดใหม่ |
| tell | บอก | `tellListChanged` บอกว่ารายการเปลี่ยน |
| stop | หยุด | `stopIfError` หยุดถ้ามี error |
| use... | (hook ของ React) ใช้... | `useGroups` ใช้ข้อมูลหมวด |
| when... | เมื่อ... (ตัวรับเหตุการณ์) | `whenKeyPressed` เมื่อกดปุ่มคีย์บอร์ด |
| press | กด | `pressSaveButton` กดปุ่มบันทึก |
| keep | เก็บไว้ | `keepDraft` เก็บร่าง |

## คำนาม (สิ่งของ)

| คำ | แปลว่า |
|---|---|
| note | โน๊ต / ไอเดีย |
| task | งาน / สิ่งที่ต้องทำ |
| group | หมวดหมู่ |
| trash | ถังขยะ |
| file / picture / video | ไฟล์ / รูป / วิดีโอ |
| feature | ระบบ (1 ส่วนของแอพ เช่น ระบบโน๊ต) |
| page | หน้า (เต็มจอ) |
| parts | ชิ้นส่วนหน้าจอ |
| layout | โครงหน้า |
| menu | เมนู |
| box | กล่อง |
| card | การ์ด |
| button | ปุ่ม |
| tag | ป้าย |
| draft | ร่าง (ข้อความที่ยังไม่ได้บันทึกขึ้นเน็ต) |
| content | เนื้อหา |
| plain text | ตัวหนังสือล้วน (ไม่มีตัวหนา รูป ฯลฯ) |
| title | หัวข้อ / ชื่อ |
| item / items | ของ 1 ชิ้น / หลายชิ้น |
| list | รายการ |
| status | สถานะ |
| link | ลิงก์ |
| path | ที่อยู่ไฟล์ |
| owner | เจ้าของ |
| importance | ความสำคัญ |
| due date | วันกำหนดส่ง |
| cover | ภาพปก |
| pattern | ลาย |
| backup | สำรองข้อมูล |
| database | ฐานข้อมูล |

## คำคุณศัพท์ / อื่นๆ

| คำ | แปลว่า |
|---|---|
| all | ทั้งหมด |
| new | ใหม่ |
| old | เก่า |
| one | 1 อัน |
| latest | ล่าสุด |
| unused | ไม่ได้ใช้ |
| forever | ถาวร |
| live | สด (อัปเดตทันที) |
| small | เล็ก / แบบย่อ |
| public | สาธารณะ (ไม่ต้องล็อกอิน) |
| selected | ที่เลือกอยู่ |
| shown | ที่แสดงอยู่ |
| ready | พร้อม |

## คำที่ขึ้นต้น `is` / `has` (ได้ค่า true / false)

| ชื่อ | แปลว่า |
|---|---|
| `isDone` | งานเสร็จแล้วไหม |
| `isPinned` | ปักหมุดไหม |
| `isLoading` | กำลังโหลดไหม |
| `isSaving` | กำลังบันทึกไหม |
| `isUploading` | กำลังอัปโหลดไหม |
| `isOpen` | เปิดอยู่ไหม (กล่องเด้ง) |
| `isSelected` | ถูกเลือกอยู่ไหม |
| `isChecking` | กำลังเช็คการล็อกอินไหม |
| `isDatabaseReady` | ตั้งค่าฐานข้อมูลครบแล้วไหม |
| `isEmptyNote` | โน๊ตว่างเปล่าไหม |
| `isLate` | เลยกำหนดส่งแล้วไหม |
| `hasSideBox` | มีแถบขวาไหม |

---

## ชื่อสำคัญ อยู่ไฟล์ไหน

| ชื่อ | คืออะไร | ไฟล์ |
|---|---|---|
| `database` | ตัวเชื่อมต่อ Supabase | `src/shared/database.ts` |
| `tellListChanged` | บอกให้หน้าจอโหลดรายการใหม่ | `src/shared/database.ts` |
| `useLiveList` | ดึงรายการ + อัปเดตสด | `src/shared/data/useLiveList.ts` |
| `useAutoSave` / `saveNow` | บันทึกอัตโนมัติ / บันทึกทันที | `src/shared/data/useAutoSave.ts` |
| `useLogin` / `MustLogin` | ดูผู้ใช้ / บังคับล็อกอิน | `src/shared/login/` |
| `uploadPicture` / `uploadVideo` / `getFileLink` / `deleteFile` | จัดการไฟล์ | `src/shared/files/fileStorage.ts` |
| `useGroups` / `GroupPicker` / `GroupEditBox` | หมวดหมู่ | `src/shared/groups/` |
| `WindowBox` / `RoundButton` / `TagButton` ... | ชิ้นส่วนหน้าจอ | `src/shared/parts/` |
| `PageLayout` / `SideMenu` / `BottomMenu` / `RightSideBox` | โครงหน้า | `src/shared/layout/` |
| `AppFeature` / `TrashActions` | แบบฟอร์มของระบบ | `src/features/AppFeature.ts` |
| `allFeatures` | รายชื่อระบบทั้งหมด | `src/features/allFeatures.ts` |
| `homeCard` / `sideCard` | การ์ดหน้าแรก / กล่องแถบขวา | ใน `feature.tsx` ของแต่ละระบบ |
| `deleteOldTrash` / `TRASH_KEEP_DAYS` | ลบของในถังเกิน 30 วัน | `src/features/trash/deleteOldTrash.ts` |
| `NoteEditor` / `PictureBlock` / `VideoBlock` | ช่องเขียนโน๊ต / บล็อกรูป / บล็อกวิดีโอ | `src/features/notes/parts/editor/` |

## คำจาก React / ไลบรารี ที่เปลี่ยนชื่อไม่ได้
บางคำมาจากเครื่องมือภายนอก ต้องใช้ตามนั้น

| คำ | แปลว่า |
|---|---|
| `useState` | เก็บค่าที่เปลี่ยนได้ (เปลี่ยนแล้วหน้าจอวาดใหม่) |
| `useEffect` | ทำอะไรบางอย่างหลังหน้าจอวาด / เมื่อค่าเปลี่ยน |
| `useRef` | เก็บค่าโดยไม่ทำให้หน้าจอวาดใหม่ |
| `useMemo` / `useCallback` | จำผลลัพธ์ / ฟังก์ชันไว้ ไม่คำนวณซ้ำ |
| `className` | class ของ Tailwind (หน้าตา) |
| `onClick` / `onChange` | เมื่อกด / เมื่อค่าเปลี่ยน |
| `props` | ค่าที่ส่งเข้าชิ้นส่วนหน้าจอ |
| `async` / `await` | รอให้งานที่ใช้เวลา (เช่น ส่งข้อมูลขึ้นเน็ต) เสร็จก่อน |
| `try` / `catch` | ลองทำ / ถ้าพลาดให้ทำส่วนนี้แทน |
| `Promise` | งานที่ยังไม่เสร็จ (จะเสร็จทีหลัง) |
| snake_case (เช่น `group_id`) | ชื่อคอลัมน์ในฐานข้อมูล (ในโค้ดแปลงเป็น `groupId`) |

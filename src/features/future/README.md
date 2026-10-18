# ระบบ "ถึงตัวเองในอนาคต" (future)

เขียนข้อความถึงตัวเอง แล้วเลือกวันที่จะเปิดอ่าน พอถึงวัน ข้อความจะขึ้นโชว์ในหน้าแรก

| ลิงก์ | หน้า |
|---|---|
| `/future` | เขียนข้อความ + ดูข้อความที่ถึงวันแล้ว / ที่รอวันเปิด |

## ไฟล์

| ไฟล์ | ทำอะไร |
|---|---|
| `feature.tsx` | ข้อมูลระบบ: เมนู "อนาคต", การ์ดหน้าแรก, ถังขยะ, สำรองข้อมูล |
| `types.ts` | `FutureMessage` (ข้อความ 1 ฉบับ), `NewFutureMessage` |
| `database.ts` | `getAllFutureMessages`, `addFutureMessage`, `saveFutureMessage`, `markFutureMessageRead`, `moveFutureMessageToTrash`, `bringFutureMessageBack`, `deleteFutureMessageForever`, `getFutureMessagesInTrash`, `getAllFutureMessagesForBackup`, `isOpenNow` (ถึงวันเปิดหรือยัง) |
| `pages/FutureMessagesPage.tsx` | หน้าหลัก: กล่องเขียน + "ถึงวันเปิดแล้ว" + "รอวันเปิด" |
| `parts/WriteFutureMessageBox.tsx` | กล่องเขียนข้อความ + ปุ่มลัดเลือกวัน (พรุ่งนี้ / 1 สัปดาห์ / 1 เดือน / 6 เดือน / 1 ปี) หรือเลือกวันเอง |
| `parts/FutureMessageCard.tsx` | ข้อความ 1 ฉบับ: ถึงวันแล้ว = โชว์เต็ม / ยังไม่ถึง = ซ่อน (กดรูปตาเพื่อแอบดูและแก้ไข) |
| `parts/FutureHomeCard.tsx` | ในหน้าแรก: โชว์ข้อความที่ถึงวันแล้วแต่ยังไม่อ่าน (กด "อ่านแล้ว" จะหายไปจากหน้าแรก) |

## ตารางในฐานข้อมูล
`future_messages` (สร้างด้วย `supabase/sql/003_future_and_shop.sql`) ดูรายละเอียดใน `docs/03-database.md`

## อยากแก้...
| อยาก | แก้ที่ |
|---|---|
| ปุ่มลัดเลือกวัน | `QUICK_DATES` ใน `WriteFutureMessageBox.tsx` |
| วันเริ่มต้นตอนเขียนใหม่ (ตอนนี้ = อีก 1 เดือน) | `dateFromToday({ months: 1 })` ใน `WriteFutureMessageBox.tsx` |
| ไม่อยากให้ขึ้นในหน้าแรก | ลบบรรทัด `homeCard` ใน `feature.tsx` |
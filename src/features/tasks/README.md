# ระบบ "งาน" (tasks)

จดสิ่งที่ต้องทำ ตั้งหมวด / ความสำคัญ / วันกำหนดส่ง ติ๊กเสร็จ

| ลิงก์ | หน้า |
|---|---|
| `/tasks` | หน้าสิ่งที่ต้องทำ (หน้าตาแบบรูป "To-do.") |

## ไฟล์

| ไฟล์ | ทำอะไร |
|---|---|
| `feature.tsx` | ข้อมูลระบบ: เมนู "งาน", การ์ดหน้าแรก, กล่องแถบขวา, ถังขยะ, สำรองข้อมูล |
| `types.ts` | `Task`, `NewTask`, `Importance` (low/medium/high) + `IMPORTANCE_INFO` (ชื่อไทย + สีป้าย) |
| `database.ts` | `getAllTasks`, `addNewTask`, `saveTask`, `markTaskDone`, `moveTaskToTrash`, `bringTaskBack`, `deleteTaskForever`, `getTasksInTrash`, `getAllTasksForBackup`, `sortTasks` |
| `pages/TasksPage.tsx` | หน้าหลัก: กล่องเพิ่มงาน, กรองหมวด, "แสดงที่เสร็จแล้ว", รายการงาน |
| `parts/AddTaskBox.tsx` | กล่องเพิ่มงาน (ข้อความ + หมวด + ความสำคัญ + วันส่ง) กด Enter ก็เพิ่มได้ |
| `parts/TaskRow.tsx` | งาน 1 แถว: วงกลมติ๊ก, กดข้อความเพื่อแก้, ปุ่มตั้งวันส่ง, ปุ่มลบ (`isSmall` = แบบย่อ) |
| `parts/TasksSummaryCard.tsx` | วงกลม % + งานถัดไป 5 อัน (ใช้ทั้งหน้าแรกและแถบขวา) |

## ลำดับการเรียงงาน (`sortTasks`)
1. ยังไม่เสร็จ ก่อน เสร็จแล้ว
2. วันส่งใกล้ ก่อน (ไม่มีวันส่ง อยู่ท้าย)
3. ความสำคัญ สูง → กลาง → ต่ำ
4. สร้างใหม่ ก่อน

## อยากแก้...
| อยาก | แก้ที่ |
|---|---|
| ชื่อ/สีระดับความสำคัญ | `IMPORTANCE_INFO` ใน `types.ts` |
| ความสำคัญเริ่มต้นตอนเพิ่มงาน | `useState<Importance>('medium')` ใน `AddTaskBox.tsx` |
| จำนวนงานในการ์ดสรุป | `.slice(0, 5)` ใน `TasksSummaryCard.tsx` |
| ข้อความ "อีก 3 วัน" / "เลยมา 2 วัน" | `showDueText` ใน `src/shared/dateTools.ts` |

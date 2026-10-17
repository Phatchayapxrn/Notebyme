// =====================================================================
// allFeatures.ts : รายชื่อระบบทั้งหมดในแอพ
//
// อยากเพิ่มระบบใหม่?
//   1) สร้างโฟลเดอร์ใหม่ใน src/features/ (ดูตัวอย่างจาก tasks/)
//   2) import แล้วใส่ชื่อในรายการด้านล่าง 1 บรรทัด
//   เมนู หน้า การ์ดหน้าแรก และถังขยะ จะใช้ได้เองอัตโนมัติ
// ดูขั้นตอนละเอียด: docs/04-add-new-feature.md
// =====================================================================
import type { AppFeature } from './AppFeature'
import { homeFeature } from './home/feature'
import { notesFeature } from './notes/feature'
import { tasksFeature } from './tasks/feature'
import { trashFeature } from './trash/feature'
import { settingsFeature } from './settings/feature'
import { loginFeature } from './login/feature'

export const allFeatures: AppFeature[] = [
  homeFeature,
  notesFeature,
  tasksFeature,
  trashFeature,
  settingsFeature,
  loginFeature,
  // ระบบใหม่ ใส่ต่อตรงนี้
]

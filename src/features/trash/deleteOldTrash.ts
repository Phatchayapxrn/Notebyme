// =====================================================================
// deleteOldTrash.ts : ลบของในถังขยะที่เก็บไว้นานเกิน 30 วัน (ลบถาวร)
//
// ถูกเรียกอัตโนมัติ 1 ครั้งทุกครั้งที่เปิดแอพ (ดูใน App.tsx)
// ใช้ trashActions ของทุกระบบ ระบบใหม่ที่มี trashActions จะถูกลบตามกฎนี้ด้วย
// =====================================================================
import type { AppFeature } from '../AppFeature'

/** เก็บของในถังขยะไว้กี่วัน ก่อนลบถาวร */
export const TRASH_KEEP_DAYS = 30

/** นับว่าเหลืออีกกี่วันจะถูกลบถาวร (0 = หมดเวลาแล้ว) */
export function daysLeftInTrash(deletedAt: string): number {
  const daysPassed = (Date.now() - Date.parse(deletedAt)) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRASH_KEEP_DAYS - daysPassed))
}

/** ลบของที่หมดเวลาแล้วของทุกระบบ คืนจำนวนที่ลบไป */
export async function deleteOldTrash(features: AppFeature[]): Promise<number> {
  let deletedCount = 0
  for (const feature of features) {
    const trashActions = feature.trashActions
    if (!trashActions) continue
    try {
      const trashItems = await trashActions.getTrashItems()
      const oldItems = trashItems.filter((item) => daysLeftInTrash(item.deletedAt) === 0)
      for (const item of oldItems) {
        await trashActions.deleteForever(item.id)
        deletedCount += 1
      }
    } catch (error) {
      console.warn(`ลบของเก่าในถังขยะของ ${feature.id} ไม่สำเร็จ`, error)
    }
  }
  return deletedCount
}

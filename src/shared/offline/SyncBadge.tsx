// =====================================================================
// SyncBadge : ป้ายเล็กๆ บอกสถานะ "ออฟไลน์" / "กำลังซิงค์" (ไม่โชว์เมื่อปกติ)
// =====================================================================
import { useSyncStatus } from './syncStatus'

export function SyncBadge() {
  const { isOnline, pendingCount, isSending } = useSyncStatus()

  let text = ''
  if (!isOnline) {
    text = pendingCount > 0 ? `ออฟไลน์ · รอซิงค์ ${pendingCount} รายการ` : 'ออฟไลน์ · ใช้ข้อมูลในเครื่อง'
  } else if (isSending || pendingCount > 0) {
    text = `กำลังซิงค์ ${pendingCount} รายการ...`
  }
  if (!text) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-50 flex justify-center">
      <span
        role="status"
        className="rounded-full border border-line bg-blush px-3 py-1 text-xs font-medium text-wine shadow-sm"
      >
        {text}
      </span>
    </div>
  )
}

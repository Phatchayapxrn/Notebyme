// =====================================================================
// SaveStatusText : ข้อความเล็กๆ บอกสถานะการบันทึก
// ใช้คู่กับ useAutoSave: <SaveStatusText saveStatus={saveStatus} />
// =====================================================================
import type { ReactElement } from 'react'
import { Check, CloudOff, Loader2, AlertCircle, Pencil } from 'lucide-react'
import type { SaveStatus } from '@/shared/data/useAutoSave'

const statusInfo: Record<SaveStatus, { text: string; icon: ReactElement; colorClass: string }> = {
  saved: { text: 'บันทึกแล้ว', icon: <Check size={14} />, colorClass: 'text-soft' },
  'not-saved': { text: 'ยังไม่บันทึก', icon: <Pencil size={14} />, colorClass: 'text-rose' },
  saving: { text: 'กำลังบันทึก...', icon: <Loader2 size={14} className="animate-spin" />, colorClass: 'text-soft' },
  failed: { text: 'บันทึกไม่สำเร็จ - กดบันทึกอีกครั้ง', icon: <AlertCircle size={14} />, colorClass: 'text-danger' },
  offline: { text: 'ไม่มีเน็ต - เก็บไว้ในเครื่องก่อน', icon: <CloudOff size={14} />, colorClass: 'text-danger' },
}

export function SaveStatusText({ saveStatus }: { saveStatus: SaveStatus }) {
  const info = statusInfo[saveStatus]
  return (
    <span role="status" className={`inline-flex items-center gap-1.5 font-typewriter text-xs ${info.colorClass}`}>
      {info.icon}
      <span className="hidden sm:inline">{info.text}</span>
    </span>
  )
}

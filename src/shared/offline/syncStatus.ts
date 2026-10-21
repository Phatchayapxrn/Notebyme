// =====================================================================
// syncStatus.ts : สถานะออนไลน์/ออฟไลน์ และจำนวนคำสั่งที่รอส่ง (ใช้โชว์ป้ายบนจอ)
//
// ใช้งาน: const { isOnline, pendingCount, isSending } = useSyncStatus()
// =====================================================================
import { useSyncExternalStore } from 'react'

export interface SyncStatus {
  /** true = มีเน็ต */
  isOnline: boolean
  /** จำนวนคำสั่งที่ยังไม่ได้ส่งขึ้นฐานข้อมูล */
  pendingCount: number
  /** true = กำลังส่งอยู่ */
  isSending: boolean
}

let status: SyncStatus = { isOnline: navigator.onLine, pendingCount: 0, isSending: false }
const listeners = new Set<() => void>()

/** แก้สถานะบางส่วน แล้วบอกทุกคนที่ฟังอยู่ */
export function setSyncStatus(changes: Partial<SyncStatus>) {
  status = { ...status, ...changes }
  listeners.forEach((listener) => listener())
}

window.addEventListener('online', () => setSyncStatus({ isOnline: true }))
window.addEventListener('offline', () => setSyncStatus({ isOnline: false }))

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribe, () => status)
}

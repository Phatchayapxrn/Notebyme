// =====================================================================
// useAllFeatures : ดึงรายชื่อระบบทั้งหมด (ใช้ในหน้าที่ต้องรวมข้อมูลจากทุกระบบ
// เช่น หน้าแรก, ถังขยะ, ตั้งค่า)
//
// รายชื่อส่งมาจาก PageLayout (ผ่าน <Outlet context>) ไม่ได้ import allFeatures ตรงๆ
// เพื่อกันปัญหา "ไฟล์ import วนกันเอง"
// =====================================================================
import { useOutletContext } from 'react-router-dom'
import type { AppFeature } from '@/features/AppFeature'

export interface LayoutContext {
  features: AppFeature[]
}

export function useAllFeatures(): AppFeature[] {
  return useOutletContext<LayoutContext>().features
}

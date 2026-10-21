// =====================================================================
// AppFeature.ts : "แบบฟอร์ม" ของ 1 ระบบในแอพ
//
// ทุกระบบ (โน๊ต, สิ่งที่ต้องทำ, ถังขยะ, ...) ต้องกรอกข้อมูลตามแบบนี้
// แล้วไปใส่ชื่อในไฟล์ allFeatures.ts → เมนูและหน้าจะโผล่เองอัตโนมัติ
// ดูวิธีเพิ่มระบบใหม่ทีละขั้นได้ที่ docs/04-add-new-feature.md
// =====================================================================
import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'

/** ข้อมูลของ 1 ระบบ */
export interface AppFeature {
  /** ชื่อเรียกในโค้ด (ภาษาอังกฤษ ห้ามซ้ำ) เช่น 'notes' */
  id: string
  /** ชื่อที่โชว์ในเมนู เช่น 'ไอเดีย' */
  menuName: string
  /** ไอคอนในเมนู (เลือกได้จาก https://lucide.dev/icons) */
  menuIcon: LucideIcon
  /** ลิงก์หน้าหลักของระบบ เช่น '/notes' */
  mainPath: string
  /** ลำดับในเมนู (เลขน้อยอยู่ก่อน) */
  menuOrder: number
  /** แสดงในเมนูไหม (ค่าเริ่มต้น แสดง) */
  showInMenu?: boolean
  /** true = เข้าได้โดยไม่ต้องล็อกอิน และไม่มีเมนู (เช่น หน้าล็อกอิน) */
  isPublic?: boolean
  /** หน้าต่างๆ ของระบบนี้ (path + หน้าที่จะแสดง) */
  pages: RouteObject[]
  /** การ์ดที่จะไปโชว์ในหน้าแรก (ไม่ใส่ก็ได้) */
  homeCard?: ComponentType
  /** ลำดับการ์ดในหน้าแรก (เลขน้อยอยู่บน / ไม่ใส่ = ใช้ menuOrder) */
  homeOrder?: number
  /** กล่องเล็กที่จะโชว์ในแถบขวา บนจอคอม (ไม่ใส่ก็ได้) */
  sideCard?: ComponentType
  /** ค้นหาข้อมูลของระบบนี้ให้ช่องค้นหากลาง (ไม่ใส่ = ค้นข้อมูลของระบบนี้ไม่ได้ ค้นเจอแค่ชื่อเมนู) */
  searchItems?: (keyword: string) => Promise<SearchResult[]>
  /** ส่วนที่ทำงานเบื้องหลังทุกหน้า ตราบใดที่เปิดแอพ (เช่น ตัวเตือนของปฏิทิน) ไม่แสดงอะไรบนจอ (ไม่ใส่ก็ได้) */
  backgroundPart?: ComponentType
  /** ถ้าระบบนี้มีของที่ลบไปถังขยะได้ ให้ใส่วิธีจัดการตรงนี้ (ไม่ใส่ก็ได้) */
  trashActions?: TrashActions
  /** ดึงข้อมูลทั้งหมดของระบบนี้ สำหรับปุ่ม "สำรองข้อมูล" ในหน้าตั้งค่า (ไม่ใส่ก็ได้) */
  getBackupData?: () => Promise<unknown>
}

/** ผลค้นหา 1 รายการ (กดแล้วไปที่ link) */
export interface SearchResult {
  id: string
  title: string
  /** ข้อความเล็กๆ ใต้ชื่อ (ไม่ใส่ก็ได้) */
  previewText?: string
  /** ลิงก์ในแอพ เช่น '/notes/abc' */
  link: string
}

/** ของ 1 ชิ้นในถังขยะ */
export interface TrashItem {
  id: string
  /** ชื่อที่โชว์ในถังขยะ */
  title: string
  /** ข้อความตัวอย่างสั้นๆ */
  previewText?: string
  /** เวลาที่ลบ (ใช้นับว่าเหลืออีกกี่วันจะลบถาวร) */
  deletedAt: string
}

/** วิธีจัดการถังขยะของ 1 ระบบ */
export interface TrashActions {
  /** ชื่อประเภทของ เช่น 'ไอเดีย' */
  kindName: string
  kindEmoji: string
  /** ดึงของที่อยู่ในถังขยะ */
  getTrashItems: () => Promise<TrashItem[]>
  /** กู้คืน */
  bringBackFromTrash: (id: string) => Promise<void>
  /** ลบถาวร (ลบไฟล์ที่แนบด้วย) */
  deleteForever: (id: string) => Promise<void>
}

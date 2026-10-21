// =====================================================================
// types.ts (mails) : หน้าตาข้อมูลของระบบ "เก็บเมล"
// =====================================================================

/** ช่องข้อมูล 1 ช่องในชุด (เช่น อีเมล / รหัสผ่าน) */
export interface MailField {
  /** ชื่อช่อง (ว่างได้ → โชว์ "ข้อมูลช่องที่ N") */
  label: string
  /** ค่าที่จะคัดลอก */
  value: string
}

/** ชุดเมล 1 ชุด */
export interface MailSet {
  id: string
  title: string
  fields: MailField[]
  orderNumber: number
  createdAt: string
}

/** จำนวนช่องข้อมูลเริ่มต้นของชุดใหม่ */
export const DEFAULT_FIELD_COUNT = 4

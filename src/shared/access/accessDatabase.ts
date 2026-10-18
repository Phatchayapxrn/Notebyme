// =====================================================================
// accessDatabase.ts : อ่าน / แก้ ข้อมูลยศ และสิทธิ์การมองเห็นระบบ
//
//   getMyAccess()  = ทุกคนใช้ได้ : ถามว่า "ฉันเป็นแอดมินไหม + ระบบไหนที่ฉันเห็นไม่ได้"
//                    (ไม่บอกชื่อยศ คนทั่วไปจึงไม่รู้ว่าตัวเองมียศอะไร)
//   ฟังก์ชันอื่นๆ   = เฉพาะแอดมิน (ฐานข้อมูลกันไว้ คนอื่นเรียกแล้วจะไม่ได้ข้อมูล)
// ตารางสร้างด้วย supabase/sql/004_roles.sql
// =====================================================================
import { database, stopIfError } from '@/shared/database'

/** สิทธิ์ของฉัน */
export interface MyAccess {
  isAdmin: boolean
  /** id ของระบบที่ฉันเห็นไม่ได้ เช่น ['shop'] */
  hiddenFeatures: string[]
}

/** ยศ 1 ยศ */
export interface Role {
  id: string
  name: string
}

/** คน 1 คนในยศ */
export interface RoleMember {
  roleId: string
  email: string
}

/** กฎการมองเห็นของ 1 ระบบ */
export interface FeatureRule {
  featureId: string
  /** true = เห็นเฉพาะยศที่เลือก / false = ทุกคนเห็น */
  isLocked: boolean
  allowedRoleIds: string[]
}

/** ระบบที่ล็อกไม่ได้ ทุกคนต้องเห็นเสมอ */
export const ALWAYS_OPEN_FEATURES = ['home', 'settings', 'trash', 'login']

/** ถามสิทธิ์ของฉัน */
export async function getMyAccess(): Promise<MyAccess> {
  const { data, error } = await database.rpc('get_my_access')
  stopIfError(error)
  const result = (data ?? {}) as { is_admin?: boolean; hidden_features?: string[] }
  return { isAdmin: Boolean(result.is_admin), hiddenFeatures: result.hidden_features ?? [] }
}

/** ทำให้อีเมลเป็นแบบเดียวกัน (ตัวพิมพ์เล็ก ไม่มีช่องว่าง) */
export function cleanEmail(email: string): string {
  return email.trim().toLowerCase()
}

// ---------------------------------------------------------------------
// ยศ (เฉพาะแอดมิน)
// ---------------------------------------------------------------------

export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await database.from('roles').select('id, name').order('created_at')
  stopIfError(error)
  return (data ?? []).map((row) => ({ id: row.id as string, name: row.name as string }))
}

export async function addRole(name: string) {
  const { error } = await database.from('roles').insert({ name })
  stopIfError(error)
}

export async function renameRole(roleId: string, name: string) {
  const { error } = await database.from('roles').update({ name }).eq('id', roleId)
  stopIfError(error)
}

/** ลบยศ (คนในยศหลุดออกหมด + เอายศออกจากกฎทุกระบบ) */
export async function deleteRole(roleId: string, rules: FeatureRule[]) {
  for (const rule of rules.filter((oneRule) => oneRule.allowedRoleIds.includes(roleId))) {
    await saveFeatureRule({ ...rule, allowedRoleIds: rule.allowedRoleIds.filter((id) => id !== roleId) })
  }
  const { error } = await database.from('roles').delete().eq('id', roleId)
  stopIfError(error)
}

// ---------------------------------------------------------------------
// คนในยศ (เฉพาะแอดมิน)
// ---------------------------------------------------------------------

export async function getAllRoleMembers(): Promise<RoleMember[]> {
  const { data, error } = await database.from('role_members').select('role_id, email').order('created_at')
  stopIfError(error)
  return (data ?? []).map((row) => ({ roleId: row.role_id as string, email: row.email as string }))
}

export async function addRoleMember(roleId: string, email: string) {
  const { error } = await database.from('role_members').upsert({ role_id: roleId, email: cleanEmail(email) })
  stopIfError(error)
}

export async function removeRoleMember(roleId: string, email: string) {
  const { error } = await database.from('role_members').delete().eq('role_id', roleId).eq('email', email)
  stopIfError(error)
}

// ---------------------------------------------------------------------
// กฎการมองเห็นระบบ (เฉพาะแอดมิน)
// ---------------------------------------------------------------------

export async function getAllFeatureRules(): Promise<FeatureRule[]> {
  const { data, error } = await database.from('feature_rules').select('feature_id, is_locked, allowed_role_ids')
  stopIfError(error)
  return (data ?? []).map((row) => ({
    featureId: row.feature_id as string,
    isLocked: row.is_locked as boolean,
    allowedRoleIds: (row.allowed_role_ids as string[]) ?? [],
  }))
}

/** บันทึกกฎของ 1 ระบบ (ยังไม่มี = สร้างใหม่) */
export async function saveFeatureRule(rule: FeatureRule) {
  const { error } = await database.from('feature_rules').upsert({
    feature_id: rule.featureId,
    is_locked: rule.isLocked,
    allowed_role_ids: rule.allowedRoleIds,
    updated_at: new Date().toISOString(),
  })
  stopIfError(error)
}
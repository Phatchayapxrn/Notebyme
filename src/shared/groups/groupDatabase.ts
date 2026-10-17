// =====================================================================
// groupDatabase.ts : อ่าน / เพิ่ม / แก้ / ลบ หมวดหมู่ ในฐานข้อมูล
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import { deleteAllFilesOf } from '@/shared/files/fileStorage'
import { isPatternCover, type Group, type GroupInput } from './groupTypes'

const TABLE_NAME = 'groups'

/** แปลงข้อมูลจากฐานข้อมูล (ชื่อแบบ snake_case) → แบบที่ใช้ในโค้ด */
function rowToGroup(row: Record<string, unknown>): Group {
  return {
    id: row.id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    color: row.color as string,
    coverPicture: row.cover_picture as string,
    orderNumber: row.order_number as number,
    createdAt: row.created_at as string,
  }
}

/** ดึงหมวดหมู่ทั้งหมด เรียงตามลำดับ */
export async function getAllGroups(): Promise<Group[]> {
  const { data, error } = await database.from(TABLE_NAME).select('*').order('order_number').order('created_at')
  stopIfError(error)
  return (data ?? []).map(rowToGroup)
}

/** เพิ่มหมวดใหม่ (ต่อท้ายสุด) - groupId = กำหนด id เองได้ (ใช้ตอนอัปโหลดรูปปกก่อนสร้างหมวด) */
export async function addNewGroup(input: GroupInput, orderNumber: number, groupId?: string): Promise<Group> {
  const { data, error } = await database
    .from(TABLE_NAME)
    .insert({
      ...(groupId ? { id: groupId } : {}),
      name: input.name,
      emoji: input.emoji,
      color: input.color,
      cover_picture: input.coverPicture,
      order_number: orderNumber,
    })
    .select()
    .single()
  stopIfError(error)
  tellListChanged(TABLE_NAME)
  return rowToGroup(data!)
}

/** แก้ไขหมวด */
export async function saveGroup(groupId: string, input: Partial<GroupInput>) {
  const changes: Record<string, unknown> = {}
  if (input.name !== undefined) changes.name = input.name
  if (input.emoji !== undefined) changes.emoji = input.emoji
  if (input.color !== undefined) changes.color = input.color
  if (input.coverPicture !== undefined) changes.cover_picture = input.coverPicture
  const { error } = await database.from(TABLE_NAME).update(changes).eq('id', groupId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** สลับลำดับหมวด (ส่งรายชื่อ id ตามลำดับใหม่มา) */
export async function saveGroupOrder(groupIdsInOrder: string[]) {
  await Promise.all(
    groupIdsInOrder.map((groupId, index) =>
      database.from(TABLE_NAME).update({ order_number: index }).eq('id', groupId),
    ),
  )
  tellListChanged(TABLE_NAME)
}

/**
 * ลบหมวด (ลบเลย ไม่ผ่านถังขยะ)
 * โน๊ต/งานในหมวดนี้ไม่หาย แค่กลายเป็น "ไม่มีหมวด"
 */
export async function deleteGroup(group: Group) {
  const { error } = await database.from(TABLE_NAME).delete().eq('id', group.id)
  stopIfError(error)
  // ลบรูปปกที่อัปโหลดเองด้วย
  if (!isPatternCover(group.coverPicture)) {
    await deleteAllFilesOf({ belongsToType: 'group', belongsToId: group.id }).catch(() => {})
  }
  tellListChanged(TABLE_NAME)
  // โน๊ตและงานเปลี่ยนเป็น "ไม่มีหมวด" ให้หน้าเหล่านั้นโหลดใหม่ด้วย
  tellListChanged('notes')
  tellListChanged('tasks')
}

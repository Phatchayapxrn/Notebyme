// =====================================================================
// database.ts (tasks) : อ่าน / เพิ่ม / แก้ / ลบ สิ่งที่ต้องทำ ในฐานข้อมูล
// =====================================================================
import { database, stopIfError, tellListChanged } from '@/shared/database'
import type { NewTask, Task } from './types'

const TABLE_NAME = 'tasks'

/** แปลงข้อมูลจากฐานข้อมูล → แบบที่ใช้ในโค้ด */
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    text: row.text as string,
    isDone: row.is_done as boolean,
    importance: row.importance as Task['importance'],
    dueDate: row.due_date as string | null,
    groupId: row.group_id as string | null,
    createdAt: row.created_at as string,
    doneAt: row.done_at as string | null,
  }
}

/** ดึงงานทั้งหมด (ที่ไม่อยู่ในถังขยะ) */
export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select('id, text, is_done, importance, due_date, group_id, created_at, done_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map(rowToTask)
}

/** เพิ่มงานใหม่ */
export async function addNewTask(newTask: NewTask) {
  const { error } = await database.from(TABLE_NAME).insert({
    text: newTask.text,
    importance: newTask.importance,
    due_date: newTask.dueDate,
    group_id: newTask.groupId,
  })
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** แก้ไขงาน (ส่งมาเฉพาะส่วนที่เปลี่ยน) */
export async function saveTask(taskId: string, changes: Partial<NewTask>) {
  const row: Record<string, unknown> = {}
  if (changes.text !== undefined) row.text = changes.text
  if (changes.importance !== undefined) row.importance = changes.importance
  if (changes.dueDate !== undefined) row.due_date = changes.dueDate
  if (changes.groupId !== undefined) row.group_id = changes.groupId
  const { error } = await database.from(TABLE_NAME).update(row).eq('id', taskId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ติ๊กว่าเสร็จ / ยังไม่เสร็จ */
export async function markTaskDone(taskId: string, isDone: boolean) {
  const { error } = await database
    .from(TABLE_NAME)
    .update({ is_done: isDone, done_at: isDone ? new Date().toISOString() : null })
    .eq('id', taskId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ย้ายงานไปถังขยะ */
export async function moveTaskToTrash(taskId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: new Date().toISOString() }).eq('id', taskId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** กู้งานคืนจากถังขยะ */
export async function bringTaskBack(taskId: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: null }).eq('id', taskId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ลบงานถาวร */
export async function deleteTaskForever(taskId: string) {
  const { error } = await database.from(TABLE_NAME).delete().eq('id', taskId)
  stopIfError(error)
  tellListChanged(TABLE_NAME)
}

/** ดึงงานที่อยู่ในถังขยะ */
export async function getTasksInTrash() {
  const { data, error } = await database
    .from(TABLE_NAME)
    .select('id, text, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.text as string,
    deletedAt: row.deleted_at as string,
  }))
}

/** ดึงงานทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllTasksForBackup() {
  const { data, error } = await database.from(TABLE_NAME).select('*').order('created_at')
  stopIfError(error)
  return data ?? []
}

/**
 * เรียงงาน: ยังไม่เสร็จก่อน / ใกล้กำหนดส่งก่อน / สำคัญมากก่อน / ใหม่ก่อน
 * (ใช้ในหน้าจอ ไม่ได้เรียงในฐานข้อมูล)
 */
export function sortTasks(tasks: Task[]): Task[] {
  const importanceScore = { high: 0, medium: 1, low: 2 }
  return [...tasks].sort((first, second) => {
    if (first.isDone !== second.isDone) return first.isDone ? 1 : -1
    if (first.isDone) return (second.doneAt ?? '').localeCompare(first.doneAt ?? '')
    const firstDue = first.dueDate ?? '9999-12-31'
    const secondDue = second.dueDate ?? '9999-12-31'
    if (firstDue !== secondDue) return firstDue.localeCompare(secondDue)
    if (first.importance !== second.importance) return importanceScore[first.importance] - importanceScore[second.importance]
    return second.createdAt.localeCompare(first.createdAt)
  })
}

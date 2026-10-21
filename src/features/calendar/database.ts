// =====================================================================
// database.ts (calendar) : อ่าน / เพิ่ม / แก้ / ลบ กิจกรรมในปฏิทิน (ตาราง calendar_events)
// ใช้ชั้นออฟไลน์ (offlineData) → ใช้ได้ตอนไม่มีเน็ต แล้วซิงค์ทีหลัง
// =====================================================================
import { deleteRow, insertRow, listRows, updateRow } from '@/shared/offline/offlineData'
import type { Row } from '@/shared/offline/localStore'
import type { TrashItem } from '../AppFeature'
import type { CalEvent, EventForm, RepeatKind } from './types'

export const CALENDAR_TABLE = 'calendar_events'

function rowToEvent(row: Row): CalEvent {
  return {
    id: row.id,
    title: (row.title as string) ?? '',
    note: (row.note as string) ?? '',
    eventDate: row.event_date as string,
    isAllDay: Boolean(row.is_all_day),
    startTime: (row.start_time as string | null) ?? null,
    endTime: (row.end_time as string | null) ?? null,
    color: (row.color as string) ?? 'blue',
    repeatKind: (row.repeat_kind as RepeatKind) ?? 'none',
    repeatUntil: (row.repeat_until as string | null) ?? null,
    remindMinutes: row.remind_minutes === null || row.remind_minutes === undefined ? null : Number(row.remind_minutes),
  }
}

/** ดึงกิจกรรมทั้งหมด (ที่ไม่อยู่ในถังขยะ) */
export async function getAllEvents(): Promise<CalEvent[]> {
  const rows = await listRows(CALENDAR_TABLE)
  return rows.filter((row) => !row.deleted_at).map(rowToEvent)
}

function formToRow(form: EventForm) {
  return {
    title: form.title,
    note: form.note,
    event_date: form.eventDate,
    is_all_day: form.isAllDay,
    start_time: form.isAllDay ? null : form.startTime,
    end_time: form.isAllDay ? null : form.endTime,
    color: form.color,
    repeat_kind: form.repeatKind,
    repeat_until: form.repeatKind === 'none' ? null : form.repeatUntil,
    remind_minutes: form.remindMinutes,
  }
}

export async function addEvent(form: EventForm) {
  await insertRow(CALENDAR_TABLE, formToRow(form))
}

export async function saveEvent(eventId: string, form: EventForm) {
  await updateRow(CALENDAR_TABLE, eventId, formToRow(form))
}

export async function moveEventToTrash(eventId: string) {
  await updateRow(CALENDAR_TABLE, eventId, { deleted_at: new Date().toISOString() })
}

// ---------------------------------------------------------------------
// ถังขยะ + สำรองข้อมูล
// ---------------------------------------------------------------------

export async function getEventTrashItems(): Promise<TrashItem[]> {
  const rows = await listRows(CALENDAR_TABLE)
  return rows
    .filter((row) => row.deleted_at)
    .sort((first, second) => String(second.deleted_at).localeCompare(String(first.deleted_at)))
    .map((row) => {
      const event = rowToEvent(row)
      return { id: event.id, title: event.title || 'กิจกรรมไม่มีชื่อ', previewText: event.eventDate, deletedAt: row.deleted_at as string }
    })
}

export async function bringEventBack(eventId: string) {
  await updateRow(CALENDAR_TABLE, eventId, { deleted_at: null })
}

export async function deleteEventForever(eventId: string) {
  await deleteRow(CALENDAR_TABLE, eventId)
}

/** ดึงทั้งหมด (สำหรับสำรองข้อมูล) */
export async function getAllEventsForBackup() {
  return listRows(CALENDAR_TABLE)
}

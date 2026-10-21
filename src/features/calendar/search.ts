// =====================================================================
// search.ts (calendar) : ค้นหากิจกรรมจากชื่อ / รายละเอียด ให้ช่องค้นหากลาง (กดแล้วเปิดวันนั้น)
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch } from '@/shared/search/searchTools'
import { getAllEvents } from './database'
import { showEventTime } from './calendarTools'

export async function searchCalendar(keyword: string): Promise<SearchResult[]> {
  const events = await getAllEvents()
  return events
    .filter((event) => isMatch(keyword, event.title, event.note))
    .sort((first, second) => second.eventDate.localeCompare(first.eventDate))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map((event) => ({
      id: event.id,
      title: event.title,
      previewText: `${event.eventDate} · ${showEventTime(event)}`,
      link: `/calendar?view=day&date=${event.eventDate}`,
    }))
}

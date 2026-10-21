// =====================================================================
// search.ts (chat) : ค้นหาในข้อความแชท + ชื่อห้อง ให้ช่องค้นหากลาง (กดแล้วเปิดห้องนั้น)
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { listRows } from '@/shared/offline/offlineData'
import { MAX_RESULTS_PER_FEATURE, isMatch, snippetAround } from '@/shared/search/searchTools'
import { MESSAGES_TABLE, ROOMS_TABLE } from './database'

export async function searchChat(keyword: string): Promise<SearchResult[]> {
  const [roomRows, messageRows] = await Promise.all([listRows(ROOMS_TABLE), listRows(MESSAGES_TABLE)])
  const aliveRooms = new Map(roomRows.filter((row) => !row.deleted_at).map((row) => [row.id, (row.name as string) ?? '']))

  const roomResults: SearchResult[] = Array.from(aliveRooms, ([id, name]) => ({ id: `room-${id}`, title: `ห้อง ${name}`, link: `/chat?room=${id}` })).filter((result) =>
    isMatch(keyword, result.title),
  )

  const messageResults: SearchResult[] = messageRows
    .filter((row) => !row.deleted_at && aliveRooms.has(row.room_id as string) && isMatch(keyword, row.text as string))
    .sort((first, second) => String(second.created_at).localeCompare(String(first.created_at)))
    .map((row) => ({
      id: row.id,
      title: snippetAround(row.text as string, keyword, 60),
      previewText: `ในห้อง ${aliveRooms.get(row.room_id as string)}`,
      link: `/chat?room=${row.room_id as string}`,
    }))

  return [...roomResults, ...messageResults].slice(0, MAX_RESULTS_PER_FEATURE)
}

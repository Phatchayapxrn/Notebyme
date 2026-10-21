// =====================================================================
// search.ts (notes) : ค้นหาในไอเดีย (ชื่อ + เนื้อหา) ให้ช่องค้นหากลาง
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch, snippetAround } from '@/shared/search/searchTools'
import { getAllNotes } from './database'

export async function searchNotes(keyword: string): Promise<SearchResult[]> {
  const notes = await getAllNotes()
  return notes
    .filter((note) => isMatch(keyword, note.title, note.plainText))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map((note) => ({ id: note.id, title: note.title || '(ไม่มีชื่อ)', previewText: snippetAround(note.plainText, keyword), link: `/notes/${note.id}` }))
}

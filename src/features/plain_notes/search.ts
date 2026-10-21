// =====================================================================
// search.ts (plain_notes) : ค้นหาในโน๊ตทั่วไป ให้ช่องค้นหากลาง
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch, snippetAround } from '@/shared/search/searchTools'
import { getAllPlainNotes } from './database'
import { getNoteTitle } from './types'

export async function searchPlainNotes(keyword: string): Promise<SearchResult[]> {
  const notes = await getAllPlainNotes()
  return notes
    .filter((note) => isMatch(keyword, note.text))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map((note) => ({ id: note.id, title: getNoteTitle(note), previewText: snippetAround(note.text, keyword), link: `/plain-notes?note=${note.id}` }))
}

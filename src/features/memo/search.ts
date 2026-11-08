// =====================================================================
// search.ts (memo) : ค้นหาในโน๊ต ให้ช่องค้นหากลาง
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch, snippetAround } from '@/shared/search/searchTools'
import { getAllMemos } from './database'
import { getMemoTitle } from './types'

export async function searchMemos(keyword: string): Promise<SearchResult[]> {
  const memos = await getAllMemos()
  return memos
    .filter((memo) => isMatch(keyword, memo.plainText))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map((memo) => ({
      id: memo.id,
      title: getMemoTitle(memo),
      previewText: snippetAround(memo.plainText, keyword),
      link: `/memo/${memo.id}`,
    }))
}

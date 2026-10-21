// =====================================================================
// search.ts (mails) : ค้นหาชุดเมลจาก "ชื่อชุด" และ "ชื่อช่อง" เท่านั้น
// ตั้งใจไม่ค้นในค่าจริง (อีเมล/รหัสผ่าน) จะได้ไม่โผล่ในผลค้นหา
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch } from '@/shared/search/searchTools'
import { getAllMailSets } from './database'

export async function searchMails(keyword: string): Promise<SearchResult[]> {
  const sets = await getAllMailSets()
  return sets
    .map((set, index) => ({ set, number: index + 1 }))
    .filter(({ set }) => isMatch(keyword, set.title, ...set.fields.map((field) => field.label)))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map(({ set, number }) => ({ id: set.id, title: `ชุดที่ ${number}${set.title ? ` · ${set.title}` : ''}`, previewText: `${set.fields.length} ช่องข้อมูล`, link: '/mails' }))
}

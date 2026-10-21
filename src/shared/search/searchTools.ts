// =====================================================================
// searchTools.ts : ตัวช่วยของระบบค้นหา
//
// ใช้ในไฟล์ search.ts ของแต่ละระบบ:
//   const found = list.filter((item) => isMatch(keyword, item.title, item.text))
//   return found.slice(0, MAX_RESULTS_PER_FEATURE).map(...)
// =====================================================================

/** แต่ละระบบส่งผลค้นหาไม่เกินเท่านี้ */
export const MAX_RESULTS_PER_FEATURE = 6

/** true = มีข้อความไหนข้อความหนึ่งมีคำค้นอยู่ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) */
export function isMatch(keyword: string, ...texts: (string | null | undefined)[]): boolean {
  const lowerKeyword = keyword.trim().toLowerCase()
  if (!lowerKeyword) return false
  return texts.some((text) => text?.toLowerCase().includes(lowerKeyword))
}

/** ตัดข้อความยาวๆ ให้เหลือช่วงที่มีคำค้น (ไว้โชว์เป็นตัวอย่างใต้ชื่อ) */
export function snippetAround(text: string, keyword: string, length = 80): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const index = flat.toLowerCase().indexOf(keyword.trim().toLowerCase())
  if (index < 0 || flat.length <= length) return flat.slice(0, length)
  const start = Math.max(0, index - 20)
  return (start > 0 ? '…' : '') + flat.slice(start, start + length)
}

/** true = ข้อความนี้ดูเหมือนลิงก์เว็บ เช่น "google.com" หรือ "https://..." */
export function looksLikeUrl(text: string): boolean {
  const clean = text.trim()
  if (/\s/.test(clean)) return false
  return /^https?:\/\//i.test(clean) || /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i.test(clean)
}

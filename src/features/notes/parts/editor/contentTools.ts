// =====================================================================
// contentTools.ts : ตัวช่วยอ่านข้อมูลจากเนื้อหาโน๊ต (JSON ของ TipTap)
// =====================================================================
import type { JSONContent } from '@tiptap/react'

/** ชื่อบล็อกที่เป็นไฟล์ (ต้องตรงกับ name ใน PictureBlock / VideoBlock) */
const FILE_BLOCK_NAMES = ['picture', 'video']

/** หา path ไฟล์ทั้งหมด (รูป + วิดีโอ) ที่อยู่ในเนื้อหา */
export function getFilePathsInContent(content: JSONContent | null | undefined): string[] {
  const filePaths: string[] = []
  function lookInside(block: JSONContent) {
    if (block.type && FILE_BLOCK_NAMES.includes(block.type) && block.attrs?.filePath) {
      filePaths.push(block.attrs.filePath as string)
    }
    block.content?.forEach(lookInside)
  }
  if (content) lookInside(content)
  return filePaths
}

/** หา path รูปแรกในเนื้อหา (ไม่มีรูป = null) ใช้ทำรูปย่อ */
export function getFirstPicture(content: JSONContent | null | undefined): string | null {
  let firstPicture: string | null = null
  function lookInside(block: JSONContent) {
    if (firstPicture) return
    if (block.type === 'picture' && block.attrs?.filePath) {
      firstPicture = block.attrs.filePath as string
      return
    }
    block.content?.forEach(lookInside)
  }
  if (content) lookInside(content)
  return firstPicture
}

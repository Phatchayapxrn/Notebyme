// =====================================================================
// MemoRow : แถวโน๊ต 1 อันในรายการ (ชื่อ / วันที่ + ตัวอย่างข้อความ / โฟลเดอร์)
// =====================================================================
import { Link } from 'react-router-dom'
import { showShortDate } from '@/shared/dateTools'
import { getMemoPreview, getMemoTitle, type Memo, type MemoFolder } from '../types'

interface MemoRowProps {
  memo: Memo
  /** โฟลเดอร์ของโน๊ตนี้ (ใส่มา = โชว์ชื่อโฟลเดอร์ใต้ข้อความ) */
  folder?: MemoFolder
}

export function MemoRow({ memo, folder }: MemoRowProps) {
  const preview = getMemoPreview(memo)
  return (
    <Link to={`/memo/${memo.id}`} className="block px-4 py-3 transition hover:bg-blush/50">
      <p className="truncate font-semibold text-ink">{getMemoTitle(memo)}</p>
      <p className="mt-0.5 flex gap-2 text-sm text-soft">
        <span className="flex-none">{showShortDate(memo.updatedAt)}</span>
        <span className="min-w-0 flex-1 truncate">{preview}</span>
      </p>
      {folder && (
        <p className="mt-0.5 truncate text-xs text-soft">
          <span aria-hidden="true">{folder.emoji}</span> {folder.name}
        </p>
      )}
    </Link>
  )
}

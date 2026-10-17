// =====================================================================
// NoteCard : การ์ดโน๊ต 1 อัน ในหน้ารายการ
// มี 2 แบบ: 'list' = แถวยาว (แบบโน๊ตไอโฟน), 'grid' = การ์ดสี่เหลี่ยม
// =====================================================================
import { Link } from 'react-router-dom'
import { Pin } from 'lucide-react'
import { useFileLink } from '@/shared/files/useFileLink'
import { showShortDate } from '@/shared/dateTools'
import type { Group } from '@/shared/groups/groupTypes'
import type { NoteSummary } from '../types'

interface NoteCardProps {
  note: NoteSummary
  group?: Group
  look: 'list' | 'grid'
}

export function NoteCard({ note, group, look }: NoteCardProps) {
  const { link: pictureLink } = useFileLink(note.firstPicture)
  const title = note.title.trim() || note.plainText.split('\n')[0].trim() || 'ไอเดียใหม่'
  const previewText = note.plainText.replace(/\s+/g, ' ').trim() || 'ยังไม่มีเนื้อหา'

  if (look === 'grid') {
    return (
      <Link
        to={`/notes/${note.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border-[1.5px] border-line bg-paper shadow-pop transition hover:-translate-y-0.5 hover:border-pink"
      >
        {pictureLink ? (
          <img src={pictureLink} alt="" className="h-32 w-full object-cover" />
        ) : (
          <div className="h-2" style={{ backgroundColor: group?.color ?? 'rgb(var(--color-blush))' }} aria-hidden="true" />
        )}
        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <div className="flex items-start gap-1.5">
            <h3 className="line-clamp-2 flex-1 font-cute text-[15px] font-medium leading-snug text-ink">{title}</h3>
            {note.isPinned && <Pin size={14} className="mt-0.5 flex-none text-rose" aria-label="ปักหมุด" />}
          </div>
          {!pictureLink && <p className="line-clamp-4 text-sm text-soft">{previewText}</p>}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1 font-typewriter text-[11px] text-soft">
            <span>{showShortDate(note.updatedAt)}</span>
            {group && (
              <span className="truncate">
                {group.emoji} {group.name}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // แบบแถว
  return (
    <Link to={`/notes/${note.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-blush/40">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {note.isPinned && <Pin size={13} className="flex-none text-rose" aria-label="ปักหมุด" />}
          <h3 className="truncate font-cute text-[16px] font-medium text-ink">{title}</h3>
        </div>
        <p className="mt-0.5 truncate text-sm text-soft">
          <span className="font-typewriter text-xs text-ink/70">{showShortDate(note.updatedAt)}</span>
          <span className="mx-1.5">·</span>
          {previewText}
        </p>
        {group && (
          <p className="mt-1 truncate text-xs text-soft">
            {group.emoji} {group.name}
          </p>
        )}
      </div>
      {pictureLink && <img src={pictureLink} alt="" className="h-14 w-14 flex-none rounded-xl border border-line object-cover" />}
    </Link>
  )
}

// =====================================================================
// PlainNotesPage : หน้าโน๊ตทั่วไป (/plain-notes)
//   ไม่มี ?note=...   → รายการโน๊ต + ช่องค้นหา + ปุ่มโน๊ตใหม่
//   มี ?note=<id>     → หน้าพิมพ์โน๊ตนั้น
// =====================================================================
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pin, Plus, Search } from 'lucide-react'
import { showShortDate } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { PLAIN_NOTES_TABLE, addPlainNote, getAllPlainNotes } from '../database'
import { PlainNoteEditor } from '../parts/PlainNoteEditor'
import { getNoteTitle } from '../types'

export function PlainNotesPage() {
  const showMessage = useShowMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: notes, isLoading, errorText } = useLiveList({ tableName: PLAIN_NOTES_TABLE, getList: getAllPlainNotes })
  const [searchText, setSearchText] = useState('')

  const openedId = searchParams.get('note')
  const openedNote = notes.find((note) => note.id === openedId)

  function openNote(noteId: string) {
    setSearchParams({ note: noteId })
  }

  async function addNote() {
    try {
      openNote(await addPlainNote())
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    }
  }

  // เปิดโน๊ตอยู่ (โน๊ตที่เพิ่งสร้างอาจยังไม่โผล่ในรายการ → รอโหลดก่อน)
  if (openedId) {
    if (openedNote) return <PlainNoteEditor key={openedNote.id} note={openedNote} onBack={() => setSearchParams({}, { replace: true })} />
    if (isLoading) return <LoadingDots />
  }

  const keyword = searchText.trim().toLowerCase()
  const shownNotes = keyword ? notes.filter((note) => note.text.toLowerCase().includes(keyword)) : notes

  return (
    <>
      <PageTitle
        smallLabel="PLAIN NOTES"
        title="โน๊ตทั่วไป."
        underText="พิมพ์เร็วๆ ไม่ต้องจัดอะไร"
        rightSide={
          <RoundButton look="main" icon={<Plus size={17} />} onClick={addNote}>
            โน๊ตใหม่
          </RoundButton>
        }
      />

      <label className="relative mb-4 block">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" aria-hidden="true" />
        <input
          className="text-input pl-11"
          placeholder="ค้นหาในโน๊ต"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          aria-label="ค้นหาในโน๊ตทั่วไป"
        />
      </label>

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}

      <div className="flex flex-col gap-2">
        {!isLoading && notes.length === 0 && <EmptyMessage emoji="📝" title="ยังไม่มีโน๊ต" text="กด “โน๊ตใหม่” แล้วพิมพ์ได้เลย" />}
        {!isLoading && notes.length > 0 && shownNotes.length === 0 && <EmptyMessage emoji="🔍" title="ไม่เจอโน๊ตที่ค้นหา" />}
        {shownNotes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => openNote(note.id)}
            className="rounded-2xl border border-line bg-paper px-4 py-3 text-left transition hover:bg-blush/50"
          >
            <span className="flex items-center gap-2">
              {note.isPinned && <Pin size={14} className="flex-none text-wine" aria-label="ปักหมุด" />}
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{getNoteTitle(note)}</span>
              <span className="flex-none font-typewriter text-xs text-soft">{showShortDate(note.updatedAt)}</span>
            </span>
            <span className="mt-0.5 line-clamp-2 whitespace-pre-line text-sm text-soft">
              {note.text.split('\n').filter((line) => line.trim()).slice(1).join('\n')}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

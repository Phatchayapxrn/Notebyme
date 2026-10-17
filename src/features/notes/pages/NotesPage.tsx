// =====================================================================
// NotesPage : หน้ารวมไอเดียทั้งหมด (/notes)
//
// - ค้นหาได้ (หาจากหัวข้อ + เนื้อหา)
// - กรองตามหมวดได้ (ลิงก์ /notes?group=id ของหมวด, ?group=none = ไม่มีหมวด)
// - สลับดูแบบ แถว / การ์ด ได้
// - ไอเดียที่ปักหมุดอยู่บนสุด
// =====================================================================
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, LayoutGrid, Rows3, FolderPlus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { useGroups } from '@/shared/groups/useGroups'
import { GroupEditBox } from '@/shared/groups/GroupEditBox'
import { PageTitle } from '@/shared/parts/PageTitle'
import { RoundButton, IconButton } from '@/shared/parts/RoundButton'
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { WindowBox } from '@/shared/parts/WindowBox'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addNewNote, getAllNotes } from '../database'
import { NoteCard } from '../parts/NoteCard'
import type { NoteSummary } from '../types'

type ViewLook = 'list' | 'grid'
const VIEW_LOOK_KEY = 'notes-view-look'

/** อ่านแบบการแสดงผลที่เลือกไว้ครั้งก่อน */
function getSavedViewLook(): ViewLook {
  try {
    return localStorage.getItem(VIEW_LOOK_KEY) === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

export function NotesPage() {
  const navigate = useNavigate()
  const showMessage = useShowMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: notes, isLoading } = useLiveList({ tableName: 'notes', getList: getAllNotes })
  const { groups, findGroup } = useGroups()
  const [searchText, setSearchText] = useState('')
  const [viewLook, setViewLook] = useState<ViewLook>(getSavedViewLook)
  const [isGroupBoxOpen, setIsGroupBoxOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  /** หมวดที่เลือกกรองอยู่: 'all' = ทั้งหมด, 'none' = ไม่มีหมวด, หรือ id หมวด */
  const selectedGroup = searchParams.get('group') ?? 'all'

  function selectGroup(groupFilter: string) {
    setSearchParams(groupFilter === 'all' ? {} : { group: groupFilter }, { replace: true })
  }

  function changeViewLook(newLook: ViewLook) {
    setViewLook(newLook)
    try {
      localStorage.setItem(VIEW_LOOK_KEY, newLook)
    } catch {
      // ข้าม
    }
  }

  /** นับจำนวนไอเดียในแต่ละหมวด */
  const countByGroup = useMemo(() => {
    const counts = new Map<string, number>()
    notes.forEach((note) => counts.set(note.groupId ?? 'none', (counts.get(note.groupId ?? 'none') ?? 0) + 1))
    return counts
  }, [notes])

  /** ไอเดียที่ผ่านการกรอง + ค้นหา */
  const shownNotes = useMemo(() => {
    const searchWord = searchText.trim().toLowerCase()
    return notes.filter((note) => {
      if (selectedGroup === 'none' && note.groupId !== null) return false
      if (selectedGroup !== 'all' && selectedGroup !== 'none' && note.groupId !== selectedGroup) return false
      if (!searchWord) return true
      return `${note.title} ${note.plainText}`.toLowerCase().includes(searchWord)
    })
  }, [notes, selectedGroup, searchText])

  const pinnedNotes = shownNotes.filter((note) => note.isPinned)
  const otherNotes = shownNotes.filter((note) => !note.isPinned)

  /** สร้างไอเดียใหม่ (ใส่หมวดที่เลือกอยู่ให้เลย) แล้วเปิดหน้าแก้ไข */
  async function startNewNote() {
    setIsAdding(true)
    try {
      const groupId = selectedGroup !== 'all' && selectedGroup !== 'none' ? selectedGroup : null
      const noteId = await addNewNote(groupId)
      navigate(`/notes/${noteId}`, { state: { isNewNote: true } })
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'สร้างไอเดียไม่สำเร็จ', 'error')
      setIsAdding(false)
    }
  }

  return (
    <>
      <PageTitle
        smallLabel="IDEAS"
        title="ไอเดีย."
        underText="จดไว้ก่อน เดี๋ยวค่อยคิดต่อ"
        rightSide={
          <RoundButton look="main" icon={<Plus size={18} />} onClick={startNewNote} disabled={isAdding} className="hidden sm:inline-flex">
            ไอเดียใหม่
          </RoundButton>
        }
      />

      {/* ช่องค้นหา */}
      <label className="relative mb-4 block">
        <span className="sr-only">ค้นหาไอเดีย</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          type="search"
          className="text-input pl-11"
          placeholder="ค้นหาไอเดีย..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </label>

      {/* กรองตามหมวด */}
      <div className="mb-5 flex items-start gap-2">
        <TagRow className="flex-1">
          <TagButton look="flat" isSelected={selectedGroup === 'all'} onClick={() => selectGroup('all')}>
            ทั้งหมด {notes.length}
          </TagButton>
          {groups.map((group) => (
            <TagButton
              key={group.id}
              look="flat"
              emoji={group.emoji}
              isSelected={selectedGroup === group.id}
              onClick={() => selectGroup(group.id)}
            >
              {group.name} {countByGroup.get(group.id) ?? 0}
            </TagButton>
          ))}
          {(countByGroup.get('none') ?? 0) > 0 && (
            <TagButton look="flat" isSelected={selectedGroup === 'none'} onClick={() => selectGroup('none')}>
              ไม่มีหมวด {countByGroup.get('none')}
            </TagButton>
          )}
          <TagButton look="flat" onClick={() => setIsGroupBoxOpen(true)}>
            <FolderPlus size={15} /> เพิ่มหมวด
          </TagButton>
        </TagRow>
        {/* สลับแบบการแสดง */}
        <div className="flex flex-none rounded-full border-2 border-line bg-paper p-0.5">
          <IconButton
            label="ดูแบบการ์ด"
            onClick={() => changeViewLook('grid')}
            className={`h-8 w-8 ${viewLook === 'grid' ? 'bg-wine text-paper hover:bg-wine hover:text-paper' : ''}`}
          >
            <LayoutGrid size={16} />
          </IconButton>
          <IconButton
            label="ดูแบบแถว"
            onClick={() => changeViewLook('list')}
            className={`h-8 w-8 ${viewLook === 'list' ? 'bg-wine text-paper hover:bg-wine hover:text-paper' : ''}`}
          >
            <Rows3 size={16} />
          </IconButton>
        </div>
      </div>

      {/* รายการไอเดีย */}
      {isLoading ? (
        <LoadingDots />
      ) : shownNotes.length === 0 ? (
        <EmptyMessage
          emoji={searchText ? '🔍' : '🌸'}
          title={searchText ? 'ไม่เจอไอเดียที่ค้นหา' : 'ยังไม่มีไอเดียตรงนี้'}
          text={searchText ? 'ลองใช้คำอื่นดูนะ' : 'กดปุ่ม "ไอเดียใหม่" เพื่อเริ่มจดได้เลย'}
        >
          {!searchText && (
            <RoundButton look="main" icon={<Plus size={18} />} onClick={startNewNote} disabled={isAdding}>
              ไอเดียใหม่
            </RoundButton>
          )}
        </EmptyMessage>
      ) : (
        <div className="flex flex-col gap-6">
          {pinnedNotes.length > 0 && (
            <NoteSection title="ปักหมุด" notes={pinnedNotes} viewLook={viewLook} findGroup={findGroup} />
          )}
          {otherNotes.length > 0 && (
            <NoteSection title={pinnedNotes.length > 0 ? 'ไอเดียอื่นๆ' : undefined} notes={otherNotes} viewLook={viewLook} findGroup={findGroup} />
          )}
        </div>
      )}

      {/* ปุ่มลอย + (มือถือ) */}
      <button
        type="button"
        onClick={startNewNote}
        disabled={isAdding}
        aria-label="ไอเดียใหม่"
        className="fixed bottom-28 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-wine text-paper shadow-pop-dark transition active:scale-95 sm:hidden"
      >
        <Plus size={26} />
      </button>

      <GroupEditBox isOpen={isGroupBoxOpen} onClose={() => setIsGroupBoxOpen(false)} />
    </>
  )
}

/** กลุ่มไอเดีย (เช่น "ปักหมุด") แสดงเป็นแถว หรือ การ์ด */
function NoteSection({
  title,
  notes,
  viewLook,
  findGroup,
}: {
  title?: string
  notes: NoteSummary[]
  viewLook: ViewLook
  findGroup: ReturnType<typeof useGroups>['findGroup']
}) {
  return (
    <section>
      {title && <h2 className="small-label mb-3">{title}</h2>}
      {viewLook === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} group={findGroup(note.groupId)} look="grid" />
          ))}
        </div>
      ) : (
        <WindowBox title={`${notes.length} ideas`} insideClassName="divide-y divide-line">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} group={findGroup(note.groupId)} look="list" />
          ))}
        </WindowBox>
      )}
    </section>
  )
}

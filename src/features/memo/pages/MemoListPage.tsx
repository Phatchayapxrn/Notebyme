// =====================================================================
// MemoListPage : หน้ารายการโน๊ต (/memo) หน้าตาแบบโน๊ตไอโฟน
//   - แถบโฟลเดอร์ด้านบน (?folder=<id> ไม่ใส่ = โน๊ตทั้งหมด)
//   - ช่องค้นหา
//   - "ปักหมุดอยู่" (พับได้) แล้วตามด้วยกลุ่มตามเวลา: วันนี้ / 7 วัน / 30 วัน / รายเดือน
// =====================================================================
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, FolderPlus, Pencil, Pin, Plus, Search } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { RoundButton, IconButton } from '@/shared/parts/RoundButton'
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { FOLDERS_TABLE, MEMOS_TABLE, addMemo, getAllFolders, getAllMemos } from '../database'
import { groupByTime } from '../groupByTime'
import { FolderEditBox } from '../parts/FolderEditBox'
import { MemoRow } from '../parts/MemoRow'
import type { Memo } from '../types'

export function MemoListPage() {
  const navigate = useNavigate()
  const showMessage = useShowMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: memos, isLoading, errorText } = useLiveList({ tableName: MEMOS_TABLE, getList: getAllMemos })
  const { items: folders } = useLiveList({ tableName: FOLDERS_TABLE, getList: getAllFolders })
  const [searchText, setSearchText] = useState('')
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false)

  const folderId = searchParams.get('folder')
  const openedFolder = folders.find((folder) => folder.id === folderId)

  function chooseFolder(newFolderId: string | null) {
    setSearchParams(newFolderId ? { folder: newFolderId } : {}, { replace: true })
  }

  async function addNewMemo() {
    try {
      const memoId = await addMemo(openedFolder?.id ?? null)
      navigate(`/memo/${memoId}`)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    }
  }

  // โน๊ตที่ต้องโชว์ (ตามโฟลเดอร์ + คำค้นหา)
  const keyword = searchText.trim().toLowerCase()
  const shownMemos = useMemo(
    () =>
      memos.filter(
        (memo) =>
          (!openedFolder || memo.folderId === openedFolder.id) && (!keyword || memo.plainText.toLowerCase().includes(keyword)),
      ),
    [memos, openedFolder, keyword],
  )
  const pinnedMemos = shownMemos.filter((memo) => memo.isPinned)
  const timeGroups = useMemo(() => groupByTime(shownMemos.filter((memo) => !memo.isPinned)), [shownMemos])

  /** แถวโน๊ต (ตอนดู "ทั้งหมด" จะโชว์ชื่อโฟลเดอร์ใต้ข้อความด้วย) */
  function renderRow(memo: Memo) {
    const folder = openedFolder ? undefined : folders.find((item) => item.id === memo.folderId)
    return <MemoRow key={memo.id} memo={memo} folder={folder} />
  }

  return (
    <>
      <PageTitle
        smallLabel="NOTES"
        title="โน๊ต."
        underText={`${openedFolder ? `${openedFolder.emoji} ${openedFolder.name}` : 'ทั้งหมด'} · ${shownMemos.length} โน๊ต`}
        rightSide={
          <RoundButton look="main" icon={<Plus size={17} />} onClick={addNewMemo}>
            โน๊ตใหม่
          </RoundButton>
        }
      />

      {/* โฟลเดอร์ */}
      <div className="mb-3 flex items-center gap-1">
        <TagRow className="min-w-0 flex-1">
          <TagButton isSelected={!openedFolder} onClick={() => chooseFolder(null)} emoji="🗂️">
            ทั้งหมด
          </TagButton>
          {folders.map((folder) => (
            <TagButton key={folder.id} isSelected={openedFolder?.id === folder.id} onClick={() => chooseFolder(folder.id)} emoji={folder.emoji}>
              {folder.name}
            </TagButton>
          ))}
        </TagRow>
        {openedFolder && (
          <IconButton label="แก้ไขโฟลเดอร์" onClick={() => setIsEditFolderOpen(true)}>
            <Pencil size={17} />
          </IconButton>
        )}
        <IconButton label="สร้างโฟลเดอร์ใหม่" onClick={() => setIsNewFolderOpen(true)}>
          <FolderPlus size={18} />
        </IconButton>
      </div>

      {/* ค้นหา */}
      <label className="relative mb-4 block">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" aria-hidden="true" />
        <input
          className="text-input pl-11"
          placeholder="ค้นหาในโน๊ต"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          aria-label="ค้นหาในโน๊ต"
        />
      </label>

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}
      {!isLoading && memos.length === 0 && <EmptyMessage emoji="📝" title="ยังไม่มีโน๊ต" text="กด “โน๊ตใหม่” แล้วพิมพ์ได้เลย" />}
      {!isLoading && memos.length > 0 && shownMemos.length === 0 && (
        <EmptyMessage emoji={keyword ? '🔍' : '📂'} title={keyword ? 'ไม่เจอโน๊ตที่ค้นหา' : 'โฟลเดอร์นี้ยังว่างอยู่'} />
      )}

      <div className="flex flex-col gap-6">
        {pinnedMemos.length > 0 && (
          <Section
            title="ปักหมุดอยู่"
            icon={<Pin size={14} aria-hidden="true" />}
            isOpen={isPinnedOpen}
            onToggle={() => setIsPinnedOpen((isOpen) => !isOpen)}
          >
            {pinnedMemos.map(renderRow)}
          </Section>
        )}
        {timeGroups.map((group) => (
          <Section key={group.title} title={group.title}>
            {group.memos.map(renderRow)}
          </Section>
        ))}
      </div>

      <FolderEditBox isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} onDone={(newId) => newId && chooseFolder(newId)} />
      <FolderEditBox
        isOpen={isEditFolderOpen}
        onClose={() => setIsEditFolderOpen(false)}
        folder={openedFolder}
        onDone={(id) => !id && chooseFolder(null)}
      />
    </>
  )
}

/** กลุ่มโน๊ต 1 กลุ่ม: หัวข้อ + กล่องมุมมนที่ข้างในเป็นแถวคั่นด้วยเส้น */
function Section({
  title,
  icon,
  isOpen = true,
  onToggle,
  children,
}: {
  title: string
  icon?: ReactNode
  isOpen?: boolean
  /** ใส่มา = หัวข้อกดพับ/กางได้ */
  onToggle?: () => void
  children: ReactNode
}) {
  const heading = (
    <span className="flex items-center gap-1.5 text-lg font-semibold text-ink">
      {icon}
      {title}
    </span>
  )
  return (
    <section>
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={isOpen} className="mb-2 flex w-full items-center justify-between text-left">
          {heading}
          {isOpen ? <ChevronDown size={18} className="text-soft" /> : <ChevronRight size={18} className="text-soft" />}
        </button>
      ) : (
        <div className="mb-2">{heading}</div>
      )}
      {isOpen && <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">{children}</div>}
    </section>
  )
}

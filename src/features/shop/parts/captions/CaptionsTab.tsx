// =====================================================================
// CaptionsTab : แท็บ "แคปชั่น" ในหน้าร้าน (เก็บแคปชั่น + วางแผนโพสต์)
//   - หมวดแคปชั่น (แบบหน้าไอเดีย) : การ์ดหมวดมีภาพปก กดแล้วดูเฉพาะหมวดนั้น (?group=<id> / none)
//     สร้างหมวดไว้ก่อน แล้วค่อยวางแคปชั่นลงไป → แคปชั่นใหม่เข้าหมวดที่เลือกอยู่ทันที
//   - ช่องวางแคปชั่น : เลือกวัน แล้ววาง = เพิ่มแคปชั่นของวันนั้นทันที (ล้างวันที่ = เก็บเข้าคลัง)
//   - กลุ่มที่โชว์ (เรียงจากด่วนสุด):
//       เลยกำหนด (ยังไม่โพสต์) → วันนี้ → ที่กำลังจะถึง (แยกตามวัน) → คลังสำรอง (ไม่กำหนดวัน) → โพสต์แล้ว (พับไว้)
//   - ทุกใบมีปุ่มคัดลอก ติ๊กโพสต์แล้ว แก้ไข ลบ
// =====================================================================
import { useMemo, useState, type ClipboardEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, ClipboardPaste, Pencil, Plus, Search, Settings2 } from 'lucide-react'
import { showFullDate, todayAsText } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { GroupCard } from '@/shared/groups/GroupCard'
import { GroupEditBox } from '@/shared/groups/GroupEditBox'
import type { Group } from '@/shared/groups/groupTypes'
import { useGroups } from '@/shared/groups/useGroups'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PopupBox } from '@/shared/parts/PopupBox'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { IconButton, RoundButton } from '@/shared/parts/RoundButton'
import { cleanText } from '@/shared/text/copyText'
import { GroupManager } from '@/features/settings/GroupManager'
import { CAPTIONS_TABLE, addShopCaption, getAllShopCaptions } from '../../database'
import type { ShopCaption } from '../../types'
import { CaptionCard } from './CaptionCard'
import { CaptionEditBox } from './CaptionEditBox'

/** ค่าพิเศษของตัวกรอง (?group=none) = แคปชั่นที่ไม่มีหมวด */
const NO_GROUP = 'none'

/** วงแหวนรอบการ์ดหมวดที่เลือกอยู่ */
const SELECTED_RING = 'ring-2 ring-wine ring-offset-2 ring-offset-cream'

export function CaptionsTab() {
  const showMessage = useShowMessage()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: allCaptions, isLoading, errorText } = useLiveList({ tableName: CAPTIONS_TABLE, getList: getAllShopCaptions })
  const { groups: captionGroups, findGroup } = useGroups('caption')
  const [pasteText, setPasteText] = useState('')
  const [pasteDate, setPasteDate] = useState(todayAsText)
  const [isAdding, setIsAdding] = useState(false)
  const [isPostedOpen, setIsPostedOpen] = useState(false)
  const [isNewBoxOpen, setIsNewBoxOpen] = useState(false)
  const [editingCaption, setEditingCaption] = useState<ShopCaption | undefined>()
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false)
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>()
  const [isManagerOpen, setIsManagerOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  // หมวดที่กรองอยู่ (อยู่ในลิงก์ ?group=...) : null = ทั้งหมด, 'none' = ไม่มีหมวด, หรือ id หมวด
  // (id ที่ไม่มีอยู่จริงแล้ว เช่นเพิ่งลบหมวด = ดูทั้งหมด)
  const groupParam = searchParams.get('group')
  const selectedGroup = groupParam === NO_GROUP ? NO_GROUP : (findGroup(groupParam)?.id ?? null)
  const selectedGroupInfo = findGroup(selectedGroup)

  /** เลือกหมวดกรอง (กดหมวดเดิมซ้ำ = เลิกกรอง) เก็บแท็บ tab ไว้ในลิงก์ด้วย */
  function selectGroup(groupFilter: string | null) {
    const next = new URLSearchParams(searchParams)
    if (groupFilter && groupFilter !== selectedGroup) next.set('group', groupFilter)
    else next.delete('group')
    setSearchParams(next, { replace: true })
  }

  /** จำนวนแคปชั่นในแต่ละหมวด */
  const countByGroup = useMemo(() => {
    const counts = new Map<string, number>()
    allCaptions.forEach((caption) => counts.set(caption.groupId ?? NO_GROUP, (counts.get(caption.groupId ?? NO_GROUP) ?? 0) + 1))
    return counts
  }, [allCaptions])

  // แคปชั่นที่ผ่านการกรองหมวด + ค้นหา
  const captions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return allCaptions.filter((caption) => {
      if (selectedGroup === NO_GROUP && caption.groupId !== null) return false
      if (selectedGroup && selectedGroup !== NO_GROUP && caption.groupId !== selectedGroup) return false
      if (!keyword) return true
      return `${caption.text} ${findGroup(caption.groupId)?.name ?? ''}`.toLowerCase().includes(keyword)
    })
  }, [allCaptions, selectedGroup, searchText, findGroup])

  // แบ่งกลุ่มตามวันที่โพสต์
  const dateGroups = useMemo(() => {
    const today = todayAsText()
    const notPosted = captions.filter((caption) => caption.status !== 'posted')
    const upcoming = notPosted.filter((caption) => caption.postDate && caption.postDate > today)
    // แยกที่กำลังจะถึงตามวัน (captions เรียงตามวันที่มาแล้ว)
    const upcomingByDate: { date: string; items: ShopCaption[] }[] = []
    for (const caption of upcoming) {
      const lastGroup = upcomingByDate[upcomingByDate.length - 1]
      if (lastGroup && lastGroup.date === caption.postDate) lastGroup.items.push(caption)
      else upcomingByDate.push({ date: caption.postDate!, items: [caption] })
    }
    return {
      overdue: notPosted.filter((caption) => caption.postDate && caption.postDate < today),
      today: notPosted.filter((caption) => caption.postDate === today),
      upcomingByDate,
      stash: notPosted.filter((caption) => !caption.postDate),
      // โพสต์แล้ว: ล่าสุดอยู่บน
      posted: captions.filter((caption) => caption.status === 'posted').reverse(),
    }
  }, [captions])

  /** เพิ่มแคปชั่นใหม่จากข้อความที่วาง (วันที่ว่าง = เก็บเข้าคลัง, เข้าหมวดที่เลือกอยู่) */
  async function addNewCaption(text: string) {
    const cleaned = cleanText(text)
    if (!cleaned.trim()) return
    setIsAdding(true)
    try {
      await addShopCaption({
        text: cleaned,
        postDate: pasteDate || null,
        postTime: null,
        status: 'draft',
        platforms: [],
        remind: false,
        groupId: selectedGroupInfo?.id ?? null,
      })
      showMessage(selectedGroupInfo ? `เพิ่มเข้าหมวด ${selectedGroupInfo.name} แล้ว` : pasteDate ? 'เพิ่มแคปชั่นแล้ว' : 'เก็บเข้าคลังแล้ว')
      setPasteText('')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  /** วางข้อความในช่องว่าง → กลายเป็นแคปชั่นใหม่ทันที */
  function whenPasted(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (pasteText.trim()) return // มีข้อความพิมพ์ค้างอยู่ → วางต่อท้ายตามปกติ
    const pastedText = event.clipboardData.getData('text/plain')
    if (!pastedText.trim()) return
    event.preventDefault()
    addNewCaption(pastedText)
  }

  if (isLoading) return <LoadingDots />

  const renderCard = (caption: ShopCaption, showDate = false) => (
    <CaptionCard key={caption.id} caption={caption} group={findGroup(caption.groupId)} onEdit={setEditingCaption} showDate={showDate} />
  )

  return (
    <div className="flex flex-col gap-6">
      {errorText && <p className="text-sm text-danger">{errorText}</p>}

      {/* หมวดแคปชั่น (แบบหน้าไอเดีย): กดการ์ดเพื่อดูเฉพาะหมวดนั้น */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="small-label">หมวดแคปชั่น</h2>
          <div className="flex items-center gap-1">
            {selectedGroup && (
              <RoundButton look="ghost" size="small" onClick={() => selectGroup(null)}>
                ดูทั้งหมด
              </RoundButton>
            )}
            {selectedGroupInfo && (
              <IconButton label="แก้ไขหมวดนี้" onClick={() => setGroupToEdit(selectedGroupInfo)} className="h-9 w-9">
                <Pencil size={16} />
              </IconButton>
            )}
            <IconButton label="จัดการหมวดทั้งหมด (เรียงลำดับ / ลบ)" onClick={() => setIsManagerOpen(true)} className="h-9 w-9">
              <Settings2 size={17} />
            </IconButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {captionGroups.map((group) => (
            <div key={group.id} className={`rounded-2xl transition ${selectedGroup === group.id ? SELECTED_RING : ''}`}>
              <GroupCard group={group} countText={`${countByGroup.get(group.id) ?? 0} ใบ`} onClick={() => selectGroup(group.id)} />
            </div>
          ))}
          {(countByGroup.get(NO_GROUP) ?? 0) > 0 && captionGroups.length > 0 && (
            <button
              type="button"
              onClick={() => selectGroup(NO_GROUP)}
              className={`flex min-h-[150px] flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-line bg-paper transition hover:border-pink ${
                selectedGroup === NO_GROUP ? SELECTED_RING : ''
              }`}
            >
              <span className="font-cute text-[15px] text-ink">ไม่มีหมวด</span>
              <span className="font-typewriter text-xs text-soft">{countByGroup.get(NO_GROUP)} ใบ</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsNewGroupOpen(true)}
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-soft transition hover:border-rose hover:text-ink"
          >
            <Plus size={22} />
            <span className="text-sm">หมวดใหม่</span>
          </button>
        </div>
      </section>

      {/* ช่องวางแคปชั่น */}
      <div className="rounded-3xl border-2 border-dashed border-line bg-paper/60 p-3 transition focus-within:border-rose">
        <div className="mb-1 flex items-center gap-2 px-1 text-sm text-soft">
          <ClipboardPaste size={16} aria-hidden="true" />
          วางแคปชั่นตรงนี้ = เพิ่มของวันที่เลือกทันที
        </div>
        <textarea
          className="block min-h-[80px] w-full resize-y bg-transparent px-1 py-1 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:outline-none"
          placeholder="กด Ctrl+V (มือถือ: กดค้าง > วาง) หรือพิมพ์เองก็ได้"
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          onPaste={whenPasted}
          aria-label="วางแคปชั่นเพื่อเพิ่มใหม่"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-soft">
            โพสต์วันที่
            <input
              type="date"
              className="rounded-xl border-2 border-line bg-paper px-2 py-1 text-[15px] text-ink focus:border-rose focus:outline-none"
              value={pasteDate}
              onChange={(event) => setPasteDate(event.target.value)}
              aria-label="วันที่โพสต์ของแคปชั่นที่จะเพิ่ม"
            />
          </label>
          <div className="flex gap-2">
            <RoundButton look="ghost" size="small" icon={<Plus size={15} />} onClick={() => setIsNewBoxOpen(true)}>
              ตั้งค่าละเอียด
            </RoundButton>
            <RoundButton look="main" size="small" icon={<Plus size={15} />} onClick={() => addNewCaption(pasteText)} disabled={isAdding || !pasteText.trim()}>
              เพิ่มแคปชั่น
            </RoundButton>
          </div>
        </div>
        {selectedGroupInfo && (
          <p className="mt-1 px-1 text-xs text-soft">
            จะเข้าหมวด {selectedGroupInfo.emoji} {selectedGroupInfo.name}
          </p>
        )}
        {!pasteDate && <p className="mt-1 px-1 text-xs text-soft">ไม่เลือกวัน = เก็บเข้าคลังแคปชั่นสำรอง</p>}
      </div>

      {/* ค้นหา */}
      {allCaptions.length > 0 && (
        <label className="relative block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" aria-hidden="true" />
          <input
            className="text-input pl-11"
            placeholder={selectedGroupInfo ? `ค้นหาในหมวด ${selectedGroupInfo.name}` : 'ค้นหาในแคปชั่น'}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="ค้นหาในแคปชั่น"
          />
        </label>
      )}

      {allCaptions.length > 0 && captions.length === 0 && <EmptyMessage emoji="🔍" title="ไม่เจอแคปชั่นที่ตรงกัน" text="ลองเปลี่ยนหมวดหรือคำค้นหา" />}

      {allCaptions.length === 0 && (
        <EmptyMessage emoji="📅" title="ยังไม่มีแคปชั่น" text="สร้างหมวดไว้ก่อนก็ได้ แล้ววางแคปชั่นในช่องด้านบน เลือกวันที่จะโพสต์ แล้วมาเปิดดู กดคัดลอกไปโพสต์ได้เลย" />
      )}

      {dateGroups.overdue.length > 0 && (
        <Group title="⚠️ เลยกำหนดแล้ว ยังไม่ได้โพสต์" count={dateGroups.overdue.length}>
          {dateGroups.overdue.map((caption) => renderCard(caption, true))}
        </Group>
      )}

      {captions.length > 0 && (
        <Group title="📌 วันนี้" subTitle={showFullDate(todayAsText())} count={dateGroups.today.length}>
          {dateGroups.today.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-soft">วันนี้ยังไม่มีแคปชั่นที่ต้องโพสต์</p>
          ) : (
            dateGroups.today.map((caption) => renderCard(caption))
          )}
        </Group>
      )}

      {dateGroups.upcomingByDate.map((group) => (
        <Group key={group.date} title={`🗓️ ${showFullDate(group.date)}`} count={group.items.length}>
          {group.items.map((caption) => renderCard(caption))}
        </Group>
      ))}

      {dateGroups.stash.length > 0 && (
        <Group title="🗃️ คลังแคปชั่นสำรอง" subTitle="ยังไม่กำหนดวัน กดแก้ไขเพื่อตั้งวันโพสต์" count={dateGroups.stash.length}>
          {dateGroups.stash.map((caption) => renderCard(caption))}
        </Group>
      )}

      {dateGroups.posted.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setIsPostedOpen((isOpen) => !isOpen)}
            aria-expanded={isPostedOpen}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="small-label">✅ โพสต์แล้ว ({dateGroups.posted.length})</span>
            {isPostedOpen ? <ChevronDown size={18} className="text-soft" /> : <ChevronRight size={18} className="text-soft" />}
          </button>
          {isPostedOpen && <div className="mt-3 flex flex-col gap-3">{dateGroups.posted.map((caption) => renderCard(caption, true))}</div>}
        </section>
      )}

      <CaptionEditBox isOpen={isNewBoxOpen} onClose={() => setIsNewBoxOpen(false)} defaultGroupId={selectedGroupInfo?.id ?? null} />
      <CaptionEditBox isOpen={Boolean(editingCaption)} caption={editingCaption} onClose={() => setEditingCaption(undefined)} />

      {/* หมวด: สร้างใหม่ / แก้ไข / จัดการทั้งหมด */}
      <GroupEditBox
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        kind="caption"
        namePlaceholder="เช่น โปรโมชั่น, รีวิวลูกค้า"
        onSaved={(group) => group && selectGroup(group.id)}
      />
      <GroupEditBox isOpen={Boolean(groupToEdit)} group={groupToEdit} onClose={() => setGroupToEdit(undefined)} kind="caption" />
      <PopupBox isOpen={isManagerOpen} title="จัดการหมวดแคปชั่น" onClose={() => setIsManagerOpen(false)}>
        <GroupManager kind="caption" itemsName="แคปชั่น" />
      </PopupBox>
    </div>
  )
}

/** กลุ่มแคปชั่น 1 กลุ่ม: หัวข้อ + จำนวน + รายการการ์ด */
function Group({ title, subTitle, count, children }: { title: string; subTitle?: string; count: number; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-cute text-lg text-ink">{title}</h2>
        <span className="font-typewriter text-xs text-soft">
          {subTitle && `${subTitle} · `}
          {count} ใบ
        </span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

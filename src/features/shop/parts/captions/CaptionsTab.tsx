// =====================================================================
// CaptionsTab : แท็บ "แคปชั่น" ในหน้าร้าน (เก็บแคปชั่น + วางแผนโพสต์)
//   - ช่องวางแคปชั่น : เลือกวัน แล้ววาง = เพิ่มแคปชั่นของวันนั้นทันที (ล้างวันที่ = เก็บเข้าคลัง)
//   - กลุ่มที่โชว์ (เรียงจากด่วนสุด):
//       เลยกำหนด (ยังไม่โพสต์) → วันนี้ → ที่กำลังจะถึง (แยกตามวัน) → คลังสำรอง (ไม่กำหนดวัน) → โพสต์แล้ว (พับไว้)
//   - ทุกใบมีปุ่มคัดลอก ติ๊กโพสต์แล้ว แก้ไข ลบ
// =====================================================================
import { useMemo, useState, type ClipboardEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, ClipboardPaste, Plus, Search } from 'lucide-react'
import { showFullDate, todayAsText } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { cleanText } from '@/shared/text/copyText'
import { CAPTIONS_TABLE, addShopCaption, getAllShopCaptions } from '../../database'
import type { ShopCaption } from '../../types'
import { CaptionCard } from './CaptionCard'
import { CaptionEditBox } from './CaptionEditBox'

/** ค่าพิเศษของตัวกรอง = แคปชั่นที่ไม่มีหมวด */
const NO_CATEGORY = '__none__'

export function CaptionsTab() {
  const showMessage = useShowMessage()
  const { items: allCaptions, isLoading, errorText } = useLiveList({ tableName: CAPTIONS_TABLE, getList: getAllShopCaptions })
  const [pasteText, setPasteText] = useState('')
  const [pasteDate, setPasteDate] = useState(todayAsText)
  const [isAdding, setIsAdding] = useState(false)
  const [isPostedOpen, setIsPostedOpen] = useState(false)
  const [isNewBoxOpen, setIsNewBoxOpen] = useState(false)
  const [editingCaption, setEditingCaption] = useState<ShopCaption | undefined>()
  // กรอง: หมวดที่เลือก (null = ทั้งหมด, NO_CATEGORY = ไม่มีหมวด) + คำค้นหา
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  // หมวดทั้งหมดที่มี (เรียงตามชื่อ) + มีแคปชั่นที่ไม่มีหมวดไหม
  const categories = useMemo(
    () => [...new Set(allCaptions.map((caption) => caption.category).filter(Boolean))].sort((first, second) => first.localeCompare(second, 'th')),
    [allCaptions],
  )
  const hasNoCategory = allCaptions.some((caption) => !caption.category)
  // ถ้าหมวดที่เลือกอยู่หายไปแล้ว (ไม่มีแคปชั่นเหลือ) ให้กลับไปดูทั้งหมด
  const activeCategory = filterCategory === NO_CATEGORY || (filterCategory && categories.includes(filterCategory)) ? filterCategory : null

  const captions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return allCaptions.filter(
      (caption) =>
        (activeCategory === null || (activeCategory === NO_CATEGORY ? !caption.category : caption.category === activeCategory)) &&
        (!keyword || caption.text.toLowerCase().includes(keyword) || caption.category.toLowerCase().includes(keyword)),
    )
  }, [allCaptions, activeCategory, searchText])

  // แบ่งกลุ่ม
  const groups = useMemo(() => {
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

  /** เพิ่มแคปชั่นใหม่จากข้อความที่วาง (วันที่ว่าง = เก็บเข้าคลัง) */
  async function addNewCaption(text: string) {
    const cleaned = cleanText(text)
    if (!cleaned.trim()) return
    setIsAdding(true)
    try {
      await addShopCaption({ text: cleaned, postDate: pasteDate || null, postTime: null, status: 'draft', platforms: [], remind: false, category: activeCategory && activeCategory !== NO_CATEGORY ? activeCategory : '' })
      showMessage(pasteDate ? 'เพิ่มแคปชั่นแล้ว' : 'เก็บเข้าคลังแล้ว')
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
    <CaptionCard key={caption.id} caption={caption} onEdit={setEditingCaption} showDate={showDate} />
  )

  return (
    <div className="flex flex-col gap-6">
      {errorText && <p className="text-sm text-danger">{errorText}</p>}

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
        {!pasteDate && <p className="mt-1 px-1 text-xs text-soft">ไม่เลือกวัน = เก็บเข้าคลังแคปชั่นสำรอง</p>}
      </div>

      {/* ค้นหา + กรองตามหมวด */}
      {allCaptions.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" aria-hidden="true" />
            <input
              className="text-input pl-11"
              placeholder="ค้นหาในแคปชั่น"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="ค้นหาในแคปชั่น"
            />
          </label>
          {(categories.length > 0) && (
            <TagRow>
              <TagButton isSelected={activeCategory === null} onClick={() => setFilterCategory(null)}>
                ทั้งหมด ({allCaptions.length})
              </TagButton>
              {categories.map((category) => (
                <TagButton key={category} isSelected={activeCategory === category} onClick={() => setFilterCategory(category)} emoji="🏷️">
                  {category} ({allCaptions.filter((caption) => caption.category === category).length})
                </TagButton>
              ))}
              {hasNoCategory && (
                <TagButton isSelected={activeCategory === NO_CATEGORY} onClick={() => setFilterCategory(NO_CATEGORY)}>
                  ไม่มีหมวด
                </TagButton>
              )}
            </TagRow>
          )}
        </div>
      )}

      {allCaptions.length > 0 && captions.length === 0 && <EmptyMessage emoji="🔍" title="ไม่เจอแคปชั่นที่ตรงกัน" text="ลองเปลี่ยนหมวดหรือคำค้นหา" />}

      {allCaptions.length === 0 && (
        <EmptyMessage emoji="📅" title="ยังไม่มีแคปชั่น" text="วางแคปชั่นในช่องด้านบน เลือกวันที่จะโพสต์ แล้วมาเปิดดู กดคัดลอกไปโพสต์ได้เลย" />
      )}

      {groups.overdue.length > 0 && (
        <Group title="⚠️ เลยกำหนดแล้ว ยังไม่ได้โพสต์" count={groups.overdue.length}>
          {groups.overdue.map((caption) => renderCard(caption, true))}
        </Group>
      )}

      {captions.length > 0 && (
        <Group title="📌 วันนี้" subTitle={showFullDate(todayAsText())} count={groups.today.length}>
          {groups.today.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-soft">วันนี้ยังไม่มีแคปชั่นที่ต้องโพสต์</p>
          ) : (
            groups.today.map((caption) => renderCard(caption))
          )}
        </Group>
      )}

      {groups.upcomingByDate.map((group) => (
        <Group key={group.date} title={`🗓️ ${showFullDate(group.date)}`} count={group.items.length}>
          {group.items.map((caption) => renderCard(caption))}
        </Group>
      ))}

      {groups.stash.length > 0 && (
        <Group title="🗃️ คลังแคปชั่นสำรอง" subTitle="ยังไม่กำหนดวัน กดแก้ไขเพื่อตั้งวันโพสต์" count={groups.stash.length}>
          {groups.stash.map((caption) => renderCard(caption))}
        </Group>
      )}

      {groups.posted.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setIsPostedOpen((isOpen) => !isOpen)}
            aria-expanded={isPostedOpen}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="small-label">✅ โพสต์แล้ว ({groups.posted.length})</span>
            {isPostedOpen ? <ChevronDown size={18} className="text-soft" /> : <ChevronRight size={18} className="text-soft" />}
          </button>
          {isPostedOpen && <div className="mt-3 flex flex-col gap-3">{groups.posted.map((caption) => renderCard(caption, true))}</div>}
        </section>
      )}

      <CaptionEditBox isOpen={isNewBoxOpen} onClose={() => setIsNewBoxOpen(false)} categories={categories} defaultCategory={activeCategory && activeCategory !== NO_CATEGORY ? activeCategory : ''} />
      <CaptionEditBox isOpen={Boolean(editingCaption)} caption={editingCaption} onClose={() => setEditingCaption(undefined)} categories={categories} />
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

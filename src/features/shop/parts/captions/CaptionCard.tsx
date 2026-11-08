// =====================================================================
// CaptionCard : แคปชั่น 1 อัน
//   - หัวการ์ด : วัน-เวลาโพสต์ + ป้ายแพลตฟอร์ม (สี) + สถานะ
//   - ตัวการ์ด : ข้อความแคปชั่น (กดเพื่อแก้ไข)
//   - ท้ายการ์ด : ปุ่มคัดลอก / ติ๊กโพสต์แล้ว / ย้ายไปถังขยะ
// =====================================================================
import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { showFullDate } from '@/shared/dateTools'
import { CopyButton } from '@/shared/parts/CopyButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { IconButton } from '@/shared/parts/RoundButton'
import { moveShopCaptionToTrash, saveShopCaption } from '../../database'
import { CAPTION_STATUS_INFO, PLATFORM_LIST, type ShopCaption } from '../../types'

interface CaptionCardProps {
  caption: ShopCaption
  /** กดที่ข้อความ = เปิดกล่องแก้ไข */
  onEdit: (caption: ShopCaption) => void
  /** true = โชว์วันที่ในหัวการ์ด (ในกลุ่มที่ไม่ได้แยกตามวันอยู่แล้ว) */
  showDate?: boolean
}

export function CaptionCard({ caption, onEdit, showDate = false }: CaptionCardProps) {
  const showMessage = useShowMessage()
  const isPosted = caption.status === 'posted'
  const statusInfo = CAPTION_STATUS_INFO[caption.status]
  const platforms = PLATFORM_LIST.filter((platform) => caption.platforms.includes(platform.id))

  /** ติ๊ก "โพสต์แล้ว" / ย้อนกลับเป็น "พร้อมโพสต์" */
  async function togglePosted() {
    try {
      await saveShopCaption(caption.id, { status: isPosted ? 'ready' : 'posted' })
      showMessage(isPosted ? 'ย้อนกลับเป็น “พร้อมโพสต์” แล้ว' : 'ติ๊กว่าโพสต์แล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ไม่สำเร็จ', 'error')
    }
  }

  async function moveToTrash() {
    try {
      await moveShopCaptionToTrash(caption.id)
      showMessage('ย้ายไปถังขยะแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <article className={`overflow-hidden rounded-3xl border border-line bg-paper shadow-soft ${isPosted ? 'opacity-70' : ''}`}>
      <header className="flex flex-wrap items-center gap-1.5 border-b border-line bg-blush/40 px-4 py-2">
        {(showDate || caption.postTime) && (
          <span className="mr-1 font-typewriter text-xs text-ink">
            {showDate && caption.postDate && showFullDate(caption.postDate)}
            {showDate && caption.postDate && caption.postTime && ' · '}
            {caption.postTime && `${caption.postTime} น.`}
          </span>
        )}
        {platforms.map((platform) => (
          <span
            key={platform.id}
            className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: platform.color }}
          >
            {platform.shortName}
          </span>
        ))}
        <span className="flex-1" />
        {caption.remind && !isPosted && (
          <span title="ตั้งเตือนไว้" aria-label="ตั้งเตือนไว้">
            ⏰
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusInfo.badgeClass}`}>
          {statusInfo.emoji} {statusInfo.name}
        </span>
      </header>

      <button
        type="button"
        onClick={() => onEdit(caption)}
        className="block w-full px-4 py-3 text-left text-[16px] leading-relaxed text-ink transition hover:bg-blush/30"
        aria-label="แก้ไขแคปชั่น"
      >
        <span className="line-clamp-6 whitespace-pre-line">{caption.text || <span className="text-soft">(ว่าง)</span>}</span>
      </button>

      <footer className="flex items-center gap-1 border-t border-line px-3 py-2">
        <CopyButton isMain getText={() => caption.text} doneMessage="คัดลอกแคปชั่นแล้ว" />
        <IconButton label={isPosted ? 'ย้อนกลับเป็นพร้อมโพสต์' : 'ติ๊กว่าโพสต์แล้ว'} onClick={togglePosted}>
          {isPosted ? <RotateCcw size={18} /> : <Check size={19} />}
        </IconButton>
        <div className="flex-1" />
        <span className="font-typewriter text-xs text-soft">{Array.from(caption.text).length} ตัวอักษร</span>
        <IconButton label="ย้ายไปถังขยะ" onClick={moveToTrash}>
          <Trash2 size={17} />
        </IconButton>
      </footer>
    </article>
  )
}

// =====================================================================
// MessageBubble : ฟองข้อความ 1 ข้อความ
// กดที่ฟอง → เปิด/ปิดแถบเครื่องมือ (คัดลอก / ปักหมุด / แก้ไข / ลบ)
// =====================================================================
import { Copy, Pencil, Pin, PinOff, Trash2 } from 'lucide-react'
import { IconButton } from '@/shared/parts/RoundButton'
import { copyText } from '@/shared/text/copyText'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { AttachmentView } from './AttachmentView'
import type { ChatMessage } from '../types'

interface MessageBubbleProps {
  message: ChatMessage
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
}

/** เวลาในฟอง เช่น 14:30 */
function showTime(dateText: string) {
  return new Date(dateText).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message, isSelected, onSelect, onEdit, onTogglePin, onDelete }: MessageBubbleProps) {
  const showMessage = useShowMessage()

  async function copy() {
    const isSuccess = await copyText(message.text)
    showMessage(isSuccess ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ', isSuccess ? undefined : 'error')
  }

  return (
    <div className="flex flex-col items-end gap-1" id={`message-${message.id}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect()
          }
        }}
        aria-expanded={isSelected}
        className={`max-w-[85%] cursor-pointer rounded-3xl rounded-br-lg border px-4 py-2.5 text-left transition ${
          isSelected ? 'border-wine bg-blush' : 'border-line bg-paper hover:bg-blush/50'
        }`}
      >
        {message.attachments.length > 0 && (
          <div className="mb-2 flex flex-col gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentView key={attachment.path} attachment={attachment} />
            ))}
          </div>
        )}
        {message.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">{message.text}</p>}
        <p className="mt-1 flex items-center justify-end gap-1.5 font-typewriter text-[11px] text-soft">
          {message.isPinned && <Pin size={11} aria-label="ปักหมุด" />}
          {message.isEdited && <span>แก้ไขแล้ว</span>}
          {showTime(message.createdAt)}
        </p>
      </div>

      {isSelected && (
        <div className="flex items-center rounded-full border border-line bg-paper px-1">
          {message.text && (
            <IconButton label="คัดลอก" onClick={copy} className="h-9 w-9">
              <Copy size={16} />
            </IconButton>
          )}
          <IconButton label={message.isPinned ? 'เลิกปักหมุด' : 'ปักหมุด'} onClick={onTogglePin} className="h-9 w-9">
            {message.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </IconButton>
          <IconButton label="แก้ไข" onClick={onEdit} className="h-9 w-9">
            <Pencil size={16} />
          </IconButton>
          <IconButton label="ลบ" onClick={onDelete} className="h-9 w-9">
            <Trash2 size={16} />
          </IconButton>
        </div>
      )}
    </div>
  )
}

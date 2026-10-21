// =====================================================================
// ChatRoomView : ห้องแชท 1 ห้อง (ส่วนขวาของหน้า / มือถือคือทั้งหน้า)
//   - หัวห้อง : ย้อนกลับ (มือถือ) / ชื่อห้อง / ค้นหา / เปลี่ยนชื่อ / ลบห้อง
//   - แถบข้อความที่ปักหมุด (กดเพื่อดูทั้งหมด)
//   - ข้อความเรียงตามเวลา คั่นด้วยวันที่ + ช่องพิมพ์ด้านล่าง
// ใช้ key={room.id} ตอนเรียก เพื่อให้เริ่มใหม่ทุกครั้งที่เปลี่ยนห้อง
// =====================================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Pencil, Pin, Search, Trash2, X } from 'lucide-react'
import { showLongDate } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { IconButton } from '@/shared/parts/RoundButton'
import { ConfirmBox } from '@/shared/parts/PopupBox'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { MESSAGES_TABLE, getMessagesOfRoom, moveMessageToTrash, moveRoomToTrash, setMessagePinned } from '../database'
import type { ChatMessage, ChatRoom } from '../types'
import { Composer } from './Composer'
import { MessageBubble } from './MessageBubble'
import { RoomNameBox } from './RoomNameBox'

interface ChatRoomViewProps {
  room: ChatRoom
  /** กดย้อนกลับ (มือถือ) */
  onBack: () => void
}

export function ChatRoomView({ room, onBack }: ChatRoomViewProps) {
  const showMessage = useShowMessage()
  const getList = useMemo(() => () => getMessagesOfRoom(room.id), [room.id])
  const { items: messages, isLoading } = useLiveList({ tableName: MESSAGES_TABLE, getList })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<ChatMessage>()
  const [searchText, setSearchText] = useState<string | null>(null) // null = ไม่ได้เปิดช่องค้นหา
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isAskingDelete, setIsAskingDelete] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastCount = useRef(0)

  // เลื่อนลงล่างสุด เมื่อโหลดเสร็จครั้งแรก และเมื่อมีข้อความใหม่เพิ่ม
  useEffect(() => {
    if (messages.length > lastCount.current) bottomRef.current?.scrollIntoView({ block: 'end', behavior: lastCount.current === 0 ? 'auto' : 'smooth' })
    lastCount.current = messages.length
  }, [messages.length])

  const pinnedMessages = messages.filter((message) => message.isPinned)
  const keyword = (searchText ?? '').trim().toLowerCase()
  const shownMessages = messages.filter((message) => {
    if (showPinnedOnly && !message.isPinned) return false
    return !keyword || message.text.toLowerCase().includes(keyword)
  })

  async function run(action: () => Promise<void>, doneText?: string) {
    try {
      await action()
      if (doneText) showMessage(doneText)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ไม่สำเร็จ', 'error')
    }
  }

  async function deleteRoom() {
    await run(() => moveRoomToTrash(room.id), 'ย้ายห้องไปถังขยะแล้ว')
    onBack()
  }

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[24rem] flex-col rounded-3xl border border-line bg-cream md:h-[calc(100dvh-12rem)]">
      {/* หัวห้อง */}
      <header className="flex items-center gap-1 border-b border-line px-2 py-2">
        <IconButton label="กลับไปรายการห้อง" onClick={onBack} className="md:hidden">
          <ArrowLeft size={20} />
        </IconButton>
        <h2 className="min-w-0 flex-1 truncate px-2 font-semibold text-ink">{room.name}</h2>
        <IconButton label="ค้นหาในห้อง" onClick={() => setSearchText(searchText === null ? '' : null)}>
          <Search size={18} />
        </IconButton>
        <IconButton label="เปลี่ยนชื่อห้อง" onClick={() => setIsRenaming(true)}>
          <Pencil size={18} />
        </IconButton>
        <IconButton label="ลบห้อง" onClick={() => setIsAskingDelete(true)}>
          <Trash2 size={18} />
        </IconButton>
      </header>

      {searchText !== null && (
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <input
            className="text-input !rounded-full !py-2"
            placeholder="ค้นหาข้อความในห้องนี้"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            autoFocus
            aria-label="ค้นหาข้อความในห้อง"
          />
          <IconButton label="ปิดการค้นหา" onClick={() => setSearchText(null)}>
            <X size={18} />
          </IconButton>
        </div>
      )}

      {pinnedMessages.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          aria-pressed={showPinnedOnly}
          className="flex items-center gap-2 border-b border-line bg-blush/50 px-4 py-2 text-left text-sm text-wine"
        >
          <Pin size={14} className="flex-none" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{showPinnedOnly ? `แสดงเฉพาะที่ปักหมุด (${pinnedMessages.length}) — กดเพื่อดูทั้งหมด` : `ปักหมุด ${pinnedMessages.length} ข้อความ — กดเพื่อดูเฉพาะที่ปักหมุด`}</span>
        </button>
      )}

      {/* ข้อความ */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isLoading && <LoadingDots />}
        {!isLoading && messages.length === 0 && <p className="py-10 text-center text-sm text-soft">ยังไม่มีข้อความ พิมพ์ด้านล่างได้เลย</p>}
        {!isLoading && messages.length > 0 && shownMessages.length === 0 && <p className="py-10 text-center text-sm text-soft">ไม่เจอข้อความ</p>}
        <div className="flex flex-col gap-2">
          {shownMessages.map((message, index) => {
            const day = message.createdAt.slice(0, 10)
            const isNewDay = index === 0 || shownMessages[index - 1].createdAt.slice(0, 10) !== day
            return (
              <div key={message.id} className="flex flex-col gap-2">
                {isNewDay && <p className="my-2 text-center font-typewriter text-xs text-soft">{showLongDate(new Date(message.createdAt))}</p>}
                <MessageBubble
                  message={message}
                  isSelected={selectedId === message.id}
                  onSelect={() => setSelectedId(selectedId === message.id ? null : message.id)}
                  onEdit={() => {
                    setEditingMessage(message)
                    setSelectedId(null)
                  }}
                  onTogglePin={() => run(() => setMessagePinned(message.id, !message.isPinned), message.isPinned ? 'เลิกปักหมุดแล้ว' : 'ปักหมุดแล้ว')}
                  onDelete={() => run(() => moveMessageToTrash(message.id), 'ย้ายไปถังขยะแล้ว')}
                />
              </div>
            )
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="p-2">
        <Composer
          roomId={room.id}
          editingMessage={editingMessage}
          onStopEditing={() => setEditingMessage(undefined)}
          onSent={() => bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })}
        />
      </div>

      <RoomNameBox isOpen={isRenaming} room={room} onClose={() => setIsRenaming(false)} />
      <ConfirmBox
        isOpen={isAskingDelete}
        title="ลบห้องนี้?"
        text={`ห้อง "${room.name}" จะย้ายไปถังขยะ พร้อมข้อความทั้งหมดในห้อง (กู้คืนได้ภายใน 30 วัน)`}
        confirmText="ลบห้อง"
        isDanger
        onConfirm={deleteRoom}
        onClose={() => setIsAskingDelete(false)}
      />
    </div>
  )
}

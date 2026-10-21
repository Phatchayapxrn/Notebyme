// =====================================================================
// ChatPage : หน้าแชท (/chat) — เก็บข้อความส่วนตัวแบบ Google Chat คุยกับตัวเอง
//   จอคอม  : รายการห้อง (ซ้าย) | ห้องที่เปิด (ขวา)
//   มือถือ : รายการห้อง  หรือ  ห้องที่เปิด (สลับกัน) — ห้องที่เปิดจำไว้ในลิงก์ /chat?room=<id>
// =====================================================================
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquarePlus } from 'lucide-react'
import { showShortDate } from '@/shared/dateTools'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { RoundButton } from '@/shared/parts/RoundButton'
import { ROOMS_TABLE, getAllRooms } from '../database'
import { ChatRoomView } from '../parts/ChatRoomView'
import { RoomNameBox } from '../parts/RoomNameBox'

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: rooms, isLoading, errorText } = useLiveList({ tableName: ROOMS_TABLE, getList: getAllRooms })
  const [isCreating, setIsCreating] = useState(false)

  const openedId = searchParams.get('room')
  const openedRoom = rooms.find((room) => room.id === openedId)

  const openRoom = (roomId: string) => setSearchParams({ room: roomId })
  const closeRoom = () => setSearchParams({}, { replace: true })

  return (
    <>
      {/* หัวข้อ: มือถือที่เปิดห้องอยู่ ซ่อนไว้ให้ห้องมีที่เยอะๆ */}
      <div className={openedRoom ? 'hidden md:block' : ''}>
        <PageTitle
          smallLabel="CHAT"
          title="แชท."
          underText="จดข้อความ รูป วิดีโอ แยกเป็นห้องๆ"
          rightSide={
            <RoundButton look="main" icon={<MessageSquarePlus size={17} />} onClick={() => setIsCreating(true)}>
              ห้องใหม่
            </RoundButton>
          }
        />
      </div>

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}

      {!isLoading && rooms.length === 0 && <EmptyMessage emoji="💬" title="ยังไม่มีห้องแชท" text="กด “ห้องใหม่” แล้วตั้งชื่อ เช่น ไอเดียร้าน แล้วเริ่มพิมพ์ได้เลย" />}

      {rooms.length > 0 && (
        <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
          {/* รายการห้อง (มือถือ: ซ่อนตอนเปิดห้อง) */}
          <nav className={`flex flex-col gap-2 ${openedRoom ? 'hidden md:flex' : ''}`} aria-label="รายการห้องแชท">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => openRoom(room.id)}
                aria-current={room.id === openedId}
                className={`rounded-2xl border px-4 py-3 text-left transition ${room.id === openedId ? 'border-wine bg-blush' : 'border-line bg-paper hover:bg-blush/50'}`}
              >
                <span className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{room.name}</span>
                  <span className="flex-none font-typewriter text-xs text-soft">{showShortDate(room.lastTime)}</span>
                </span>
                <span className="block truncate text-sm text-soft">{room.lastText || 'ยังไม่มีข้อความ'}</span>
              </button>
            ))}
          </nav>

          {/* ห้องที่เปิด */}
          {openedRoom ? (
            <ChatRoomView key={openedRoom.id} room={openedRoom} onBack={closeRoom} />
          ) : (
            <div className="hidden items-center justify-center rounded-3xl border-2 border-dashed border-line text-sm text-soft md:flex">เลือกห้องทางซ้ายเพื่อเริ่มแชท</div>
          )}
        </div>
      )}

      <RoomNameBox isOpen={isCreating} onClose={() => setIsCreating(false)} onCreated={openRoom} />
    </>
  )
}

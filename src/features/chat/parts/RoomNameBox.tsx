// =====================================================================
// RoomNameBox : กล่องเด้งสำหรับตั้งชื่อห้องใหม่ / เปลี่ยนชื่อห้อง
// ไม่ส่ง room มา = สร้างห้องใหม่ (สร้างเสร็จเรียก onCreated ให้หน้าเปิดห้องนั้น)
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addRoom, renameRoom } from '../database'
import type { ChatRoom } from '../types'

interface RoomNameBoxProps {
  isOpen: boolean
  room?: ChatRoom
  onClose: () => void
  onCreated?: (roomId: string) => void
}

export function RoomNameBox({ isOpen, room, onClose, onCreated }: RoomNameBoxProps) {
  const showMessage = useShowMessage()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) setName(room?.name ?? '')
  }, [isOpen, room])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      showMessage('ตั้งชื่อห้องก่อนนะ', 'error')
      return
    }
    setIsSaving(true)
    try {
      if (room) await renameRoom(room.id, name.trim())
      else onCreated?.(await addRoom(name.trim()))
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={room ? 'เปลี่ยนชื่อห้อง' : 'ห้องใหม่'} onClose={onClose}>
      <form onSubmit={save} className="flex flex-col gap-4">
        <input className="text-input" placeholder="ชื่อห้อง เช่น ไอเดียร้าน" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} autoFocus aria-label="ชื่อห้อง" />
        <div className="flex justify-end gap-2">
          <RoundButton look="ghost" onClick={onClose}>
            ยกเลิก
          </RoundButton>
          <RoundButton look="main" type="submit" disabled={isSaving}>
            บันทึก
          </RoundButton>
        </div>
      </form>
    </PopupBox>
  )
}

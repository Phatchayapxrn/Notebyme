// =====================================================================
// Composer : ช่องพิมพ์ข้อความด้านล่างห้อง
//   - Ctrl+Enter (Mac: Cmd+Enter) = ส่ง / Enter = ขึ้นบรรทัดใหม่ (เหมาะกับมือถือ)
//   - ปุ่มคลิป = แนบรูป/วิดีโอ (ต้องมีเน็ต)
//   - เมื่อกดแก้ข้อความ ช่องจะกลายเป็นโหมดแก้ไข
// =====================================================================
import { useEffect, useRef, useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { useUploadFile } from '@/shared/files/useUploadFile'
import { IconButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { useSyncStatus } from '@/shared/offline/syncStatus'
import { makeId } from '@/shared/text/makeId'
import { CHAT_FILE_TYPE, editMessage, sendMessage } from '../database'
import type { ChatAttachment, ChatMessage } from '../types'

interface ComposerProps {
  roomId: string
  /** ข้อความที่กำลังแก้ (ไม่มี = พิมพ์ข้อความใหม่) */
  editingMessage?: ChatMessage
  onStopEditing: () => void
  /** ส่งเสร็จแล้ว (ให้หน้าเลื่อนลงล่างสุด) */
  onSent: () => void
}

export function Composer({ roomId, editingMessage, onStopEditing, onSent }: ComposerProps) {
  const showMessage = useShowMessage()
  const { isOnline } = useSyncStatus()
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const boxRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // id ของข้อความที่จะส่ง สร้างไว้ก่อน เพื่ออัปโหลดไฟล์ให้ผูกกับ id นี้ได้ (เปลี่ยนทุกครั้งที่ส่งเสร็จ)
  const [nextMessageId, setNextMessageId] = useState(makeId)
  const { uploadOneFile, isUploading } = useUploadFile({ belongsToType: CHAT_FILE_TYPE, belongsToId: nextMessageId })

  // กดแก้ข้อความ → ใส่ข้อความเดิมในช่อง
  useEffect(() => {
    if (!editingMessage) return
    setText(editingMessage.text)
    boxRef.current?.focus()
  }, [editingMessage])

  // ช่องพิมพ์ยืดตามข้อความ (สูงสุด ~8 บรรทัด)
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    box.style.height = 'auto'
    box.style.height = `${Math.min(box.scrollHeight, 200)}px`
  }, [text])

  async function send(attachments: ChatAttachment[] = []) {
    const cleanText = text.trim()
    if (!cleanText && attachments.length === 0) return
    setIsSending(true)
    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, cleanText)
        onStopEditing()
      } else {
        await sendMessage(roomId, cleanText, attachments, nextMessageId)
        setNextMessageId(makeId())
      }
      setText('')
      onSent()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ส่งไม่สำเร็จ', 'error')
    } finally {
      setIsSending(false)
    }
  }

  /** เลือกไฟล์แล้ว → อัปโหลด → ส่งเป็นข้อความพร้อมข้อความที่พิมพ์ค้างอยู่ */
  async function whenFilesChosen(files: FileList | null) {
    if (!files || files.length === 0) return
    const attachments: ChatAttachment[] = []
    for (const file of Array.from(files)) {
      const uploaded = await uploadOneFile(file)
      if (uploaded) attachments.push({ path: uploaded.filePath, type: uploaded.fileType, width: uploaded.width, height: uploaded.height })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    await send(attachments)
  }

  return (
    <div className="rounded-3xl border border-line bg-paper p-2">
      {editingMessage && (
        <div className="mb-1 flex items-center justify-between px-3 text-sm text-soft">
          <span>กำลังแก้ข้อความ</span>
          <IconButton
            label="ยกเลิกการแก้ไข"
            onClick={() => {
              onStopEditing()
              setText('')
            }}
            className="h-7 w-7"
          >
            <X size={15} />
          </IconButton>
        </div>
      )}
      <div className="flex items-end gap-1">
        {!editingMessage && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(event) => whenFilesChosen(event.target.files)} />
            <IconButton
              label={isOnline ? 'แนบรูปหรือวิดีโอ' : 'แนบไฟล์ต้องมีเน็ต'}
              onClick={() => fileInputRef.current?.click()}
              disabled={!isOnline || isUploading}
            >
              <Paperclip size={20} />
            </IconButton>
          </>
        )}
        <textarea
          ref={boxRef}
          rows={1}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:outline-none"
          placeholder={isUploading ? 'กำลังอัปโหลดไฟล์...' : 'พิมพ์ข้อความ (Ctrl+Enter = ส่ง)'}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              send()
            }
          }}
          aria-label="พิมพ์ข้อความ"
        />
        <IconButton label="ส่ง" onClick={() => send()} disabled={isSending || isUploading || !text.trim()} className="bg-wine text-paper hover:bg-wine/90 hover:text-paper">
          <Send size={18} />
        </IconButton>
      </div>
    </div>
  )
}

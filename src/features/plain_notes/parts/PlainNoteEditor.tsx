// =====================================================================
// PlainNoteEditor : หน้าพิมพ์โน๊ตทั่วไป (ช่องพิมพ์เปล่าๆ เต็มจอ บันทึกเองอัตโนมัติ)
// =====================================================================
import { useEffect, useState } from 'react'
import { ArrowLeft, Pin, PinOff, Trash2 } from 'lucide-react'
import { getDraft, useAutoSave } from '@/shared/data/useAutoSave'
import { IconButton } from '@/shared/parts/RoundButton'
import { SaveStatusText } from '@/shared/parts/SaveStatusText'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { movePlainNoteToTrash, savePlainNoteText, setPlainNotePinned } from '../database'
import type { PlainNote } from '../types'

interface PlainNoteEditorProps {
  note: PlainNote
  /** กดย้อนกลับไปหน้ารายการ */
  onBack: () => void
}

export function PlainNoteEditor({ note, onBack }: PlainNoteEditorProps) {
  const showMessage = useShowMessage()
  const draftName = `plain-note-${note.id}`
  const [text, setText] = useState(note.text)

  const { saveStatus, saveNow } = useAutoSave({
    value: text,
    saveValue: (value) => savePlainNoteText(note.id, value),
    isReady: true,
    draftName,
  })

  // มีร่างค้างในเครื่อง (เคยบันทึกไม่สำเร็จ) → ใส่กลับมา ระบบจะบันทึกให้เอง
  useEffect(() => {
    const draft = getDraft<string>(draftName)
    if (draft) setText(draft.value)
  }, [draftName])

  async function back() {
    await saveNow()
    onBack()
  }

  async function togglePin() {
    try {
      await setPlainNotePinned(note.id, !note.isPinned)
      showMessage(note.isPinned ? 'เลิกปักหมุดแล้ว' : 'ปักหมุดแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ไม่สำเร็จ', 'error')
    }
  }

  async function moveToTrash() {
    try {
      await movePlainNoteToTrash(note.id)
      showMessage('ย้ายไปถังขยะแล้ว')
      onBack()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <IconButton label="กลับไปรายการโน๊ต" onClick={back}>
          <ArrowLeft size={20} />
        </IconButton>
        <div className="flex-1" />
        <SaveStatusText saveStatus={saveStatus} />
        <IconButton label={note.isPinned ? 'เลิกปักหมุด' : 'ปักหมุด'} onClick={togglePin}>
          {note.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
        </IconButton>
        <IconButton label="ย้ายไปถังขยะ" onClick={moveToTrash}>
          <Trash2 size={18} />
        </IconButton>
      </div>

      <textarea
        className="block min-h-[60dvh] w-full resize-none rounded-3xl border border-line bg-paper px-5 py-4 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:border-rose focus:outline-none"
        placeholder="พิมพ์อะไรก็ได้ บรรทัดแรกจะเป็นชื่อโน๊ต..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoFocus={!note.text}
        aria-label="เนื้อหาโน๊ต"
      />
      <p className="text-right font-typewriter text-xs text-soft">{Array.from(text).length} ตัวอักษร</p>
    </div>
  )
}

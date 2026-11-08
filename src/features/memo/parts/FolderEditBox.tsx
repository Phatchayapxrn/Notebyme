// =====================================================================
// FolderEditBox : กล่องเด้งสำหรับ สร้างโฟลเดอร์ใหม่ / แก้ชื่อ-อีโมจิ / ลบโฟลเดอร์
//   <FolderEditBox isOpen onClose />                  สร้างใหม่
//   <FolderEditBox isOpen onClose folder={folder} />  แก้ไข (มีปุ่มลบ)
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { SUGGESTED_EMOJIS } from '@/shared/groups/groupTypes'
import { ConfirmBox, PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addFolder, deleteFolder, saveFolder } from '../database'
import type { MemoFolder } from '../types'

interface FolderEditBoxProps {
  isOpen: boolean
  onClose: () => void
  /** ใส่มา = แก้ไขโฟลเดอร์นี้, ไม่ใส่ = สร้างใหม่ */
  folder?: MemoFolder
  /** เรียกหลังสร้างเสร็จ (ได้ id โฟลเดอร์ใหม่) / หลังลบเสร็จ (ได้ null) */
  onDone?: (folderId: string | null) => void
}

export function FolderEditBox({ isOpen, onClose, folder, onDone }: FolderEditBoxProps) {
  const showMessage = useShowMessage()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📁')
  const [isSaving, setIsSaving] = useState(false)
  const [isAskingDelete, setIsAskingDelete] = useState(false)

  // ทุกครั้งที่เปิดกล่อง: เติมข้อมูลเดิม (หรือค่าว่างถ้าสร้างใหม่)
  useEffect(() => {
    if (!isOpen) return
    setName(folder?.name ?? '')
    setEmoji(folder?.emoji ?? '📁')
  }, [isOpen, folder])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      showMessage('ตั้งชื่อโฟลเดอร์ก่อนนะ', 'error')
      return
    }
    setIsSaving(true)
    try {
      if (folder) {
        await saveFolder(folder.id, { name: cleanName, emoji })
        onDone?.(folder.id)
      } else {
        onDone?.(await addFolder(cleanName, emoji))
      }
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeFolder() {
    if (!folder) return
    try {
      await deleteFolder(folder.id)
      showMessage('ลบโฟลเดอร์แล้ว (โน๊ตข้างในยังอยู่)')
      setIsAskingDelete(false)
      onClose()
      onDone?.(null)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <>
      <PopupBox isOpen={isOpen} title={folder ? 'แก้ไขโฟลเดอร์' : 'โฟลเดอร์ใหม่'} onClose={onClose}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            className="text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ชื่อโฟลเดอร์"
            maxLength={40}
            autoFocus
            aria-label="ชื่อโฟลเดอร์"
          />
          <div>
            <p className="small-label mb-2">อีโมจิ</p>
            <div className="flex flex-wrap gap-1.5">
              {['📁', ...SUGGESTED_EMOJIS].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  aria-pressed={emoji === item}
                  className={`grid h-10 w-10 place-items-center rounded-xl border-2 text-xl transition ${
                    emoji === item ? 'border-wine bg-blush' : 'border-line hover:border-pink'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            {folder ? (
              <RoundButton look="danger" size="small" onClick={() => setIsAskingDelete(true)}>
                ลบโฟลเดอร์
              </RoundButton>
            ) : (
              <span />
            )}
            <RoundButton look="main" type="submit" disabled={isSaving}>
              บันทึก
            </RoundButton>
          </div>
        </form>
      </PopupBox>
      <ConfirmBox
        isOpen={isAskingDelete}
        title="ลบโฟลเดอร์นี้?"
        text="โน๊ตข้างในจะไม่หาย แต่จะย้ายไปอยู่ “ไม่จัดหมวด”"
        confirmText="ลบเลย"
        isDanger
        onConfirm={removeFolder}
        onClose={() => setIsAskingDelete(false)}
      />
    </>
  )
}

// =====================================================================
// GroupEditBox : กล่องเด้งสำหรับ สร้างหมวดใหม่ / แก้ไขหมวด
// ตั้งได้: ชื่อ, อีโมจิ, สี, ภาพปก (ลายสำเร็จรูป หรืออัปโหลดรูปเอง)
//
// ใช้งาน:
//   <GroupEditBox isOpen={...} onClose={...} />                 สร้างใหม่
//   <GroupEditBox isOpen={...} onClose={...} group={group} />   แก้ไข
// =====================================================================
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { deleteFile, uploadPicture } from '@/shared/files/fileStorage'
import { GroupCard } from './GroupCard'
import { GroupCover } from './GroupCover'
import { addNewGroup, saveGroup } from './groupDatabase'
import { useGroups } from './useGroups'
import {
  COVER_PATTERNS,
  GROUP_COLORS,
  SUGGESTED_EMOJIS,
  isPatternCover,
  type Group,
  type GroupInput,
} from './groupTypes'

interface GroupEditBoxProps {
  isOpen: boolean
  onClose: () => void
  /** ใส่มา = แก้ไขหมวดนี้, ไม่ใส่ = สร้างหมวดใหม่ */
  group?: Group
  /** เรียกหลังบันทึกเสร็จ (ได้หมวดที่สร้างใหม่กลับไป) */
  onSaved?: (group: Group | undefined) => void
}

const EMPTY_GROUP: GroupInput = { name: '', emoji: '✨', color: GROUP_COLORS[0], coverPicture: 'pattern:hearts' }

export function GroupEditBox({ isOpen, onClose, group, onSaved }: GroupEditBoxProps) {
  const isNewGroup = !group
  const { groups } = useGroups()
  const showMessage = useShowMessage()
  const [form, setForm] = useState<GroupInput>(EMPTY_GROUP)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const pictureInput = useRef<HTMLInputElement>(null)
  // id ของหมวด (หมวดใหม่ สร้าง id ไว้ก่อน เพื่อใช้ผูกกับรูปปกที่อัปโหลด)
  const [groupId, setGroupId] = useState(() => group?.id ?? crypto.randomUUID())

  // ทุกครั้งที่เปิดกล่อง: เติมข้อมูลเดิม (หรือค่าว่างถ้าสร้างใหม่)
  useEffect(() => {
    if (!isOpen) return
    setForm(group ? { name: group.name, emoji: group.emoji, color: group.color, coverPicture: group.coverPicture } : EMPTY_GROUP)
    setGroupId(group?.id ?? crypto.randomUUID())
  }, [isOpen, group])

  /** แก้ค่าบางช่องในฟอร์ม */
  function changeForm(changes: Partial<GroupInput>) {
    setForm((oldForm) => ({ ...oldForm, ...changes }))
  }

  /** true = รูปปกตอนนี้ เป็นรูปที่เพิ่งอัปโหลด (ยังไม่ได้บันทึก) */
  function isNewUploadedCover() {
    return !isPatternCover(form.coverPicture) && form.coverPicture !== group?.coverPicture
  }

  /** อัปโหลดรูปปกเอง */
  async function uploadCoverPicture(file: File | undefined) {
    if (!file) return
    setIsUploading(true)
    try {
      const uploaded = await uploadPicture(file, { belongsToType: 'group', belongsToId: groupId })
      // ถ้าก่อนหน้านี้อัปโหลดไว้แล้ว (แต่ยังไม่บันทึก) ลบอันเก่าทิ้ง
      if (isNewUploadedCover()) deleteFile(form.coverPicture).catch(() => {})
      changeForm({ coverPicture: uploaded.filePath })
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  /** กดปิดโดยไม่บันทึก: ลบรูปที่เพิ่งอัปโหลดทิ้ง */
  function closeWithoutSaving() {
    if (isNewUploadedCover()) deleteFile(form.coverPicture).catch(() => {})
    onClose()
  }

  async function saveForm(event: FormEvent) {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      showMessage('ตั้งชื่อหมวดก่อนนะ', 'error')
      return
    }
    setIsSaving(true)
    try {
      let savedGroup: Group | undefined
      if (isNewGroup) {
        savedGroup = await addNewGroup({ ...form, name }, groups.length, groupId)
      } else {
        await saveGroup(group.id, { ...form, name })
        // เปลี่ยนรูปปก: ลบรูปเก่าที่อัปโหลดไว้
        if (!isPatternCover(group.coverPicture) && group.coverPicture !== form.coverPicture) {
          deleteFile(group.coverPicture).catch(() => {})
        }
      }
      showMessage(isNewGroup ? 'สร้างหมวดแล้ว' : 'บันทึกแล้ว')
      onSaved?.(savedGroup)
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={isNewGroup ? 'new-group.exe' : 'edit-group.exe'} onClose={closeWithoutSaving}>
      <form onSubmit={saveForm} className="flex flex-col gap-5">
        {/* ตัวอย่างการ์ด */}
        <div className="mx-auto w-44">
          <GroupCard group={{ ...form, name: form.name || 'ชื่อหมวด' }} countText="ตัวอย่าง" />
        </div>

        {/* ชื่อ */}
        <label className="flex flex-col gap-2">
          <span className="small-label">ชื่อหมวด</span>
          <input
            className="text-input"
            value={form.name}
            onChange={(event) => changeForm({ name: event.target.value })}
            placeholder="เช่น ไอเดียทำคอนเทนต์"
            maxLength={40}
          />
        </label>

        {/* อีโมจิ */}
        <fieldset>
          <legend className="small-label mb-2">อีโมจิ</legend>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => changeForm({ emoji })}
                aria-pressed={form.emoji === emoji}
                className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition ${
                  form.emoji === emoji ? 'bg-wine/10 ring-2 ring-wine' : 'hover:bg-blush'
                }`}
              >
                {emoji}
              </button>
            ))}
            <input
              aria-label="พิมพ์อีโมจิเอง"
              className="h-10 w-16 rounded-xl border-2 border-line bg-paper text-center text-xl focus:border-rose focus:outline-none"
              value={SUGGESTED_EMOJIS.includes(form.emoji) ? '' : form.emoji}
              onChange={(event) => event.target.value && changeForm({ emoji: [...event.target.value].slice(-1).join('') })}
              placeholder="+"
            />
          </div>
        </fieldset>

        {/* สี */}
        <fieldset>
          <legend className="small-label mb-2">สี</legend>
          <div className="flex flex-wrap gap-2">
            {GROUP_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`สี ${color}`}
                aria-pressed={form.color === color}
                onClick={() => changeForm({ color })}
                className={`h-9 w-9 rounded-full border-2 border-paper transition ${form.color === color ? 'ring-2 ring-wine ring-offset-2' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </fieldset>

        {/* ภาพปก */}
        <fieldset>
          <legend className="small-label mb-2">ภาพปก</legend>
          <div className="grid grid-cols-4 gap-2">
            {COVER_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                aria-label={`ลาย${pattern.name}`}
                aria-pressed={form.coverPicture === pattern.id}
                onClick={() => changeForm({ coverPicture: pattern.id })}
                className={`overflow-hidden rounded-xl border-2 transition ${form.coverPicture === pattern.id ? 'border-wine' : 'border-line'}`}
              >
                <GroupCover coverPicture={pattern.id} color={form.color} className="h-12 w-full" />
              </button>
            ))}
            {/* รูปที่อัปโหลดเอง */}
            {!isPatternCover(form.coverPicture) && (
              <div className="overflow-hidden rounded-xl border-2 border-wine">
                <GroupCover coverPicture={form.coverPicture} color={form.color} className="h-12 w-full" />
              </div>
            )}
            <button
              type="button"
              onClick={() => pictureInput.current?.click()}
              disabled={isUploading}
              className="grid h-12 place-items-center rounded-xl border-2 border-dashed border-line text-soft hover:border-rose hover:text-ink disabled:opacity-50"
              aria-label="อัปโหลดรูปปกเอง"
              title="อัปโหลดรูปปกเอง"
            >
              {isUploading ? '...' : <ImagePlus size={20} />}
            </button>
            <input
              ref={pictureInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                uploadCoverPicture(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-1">
          <RoundButton look="ghost" onClick={closeWithoutSaving}>
            ยกเลิก
          </RoundButton>
          <RoundButton look="main" type="submit" disabled={isSaving || isUploading}>
            {isSaving ? 'กำลังบันทึก...' : isNewGroup ? 'สร้างหมวด' : 'บันทึก'}
          </RoundButton>
        </div>
      </form>
    </PopupBox>
  )
}

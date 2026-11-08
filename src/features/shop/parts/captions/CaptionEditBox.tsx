// =====================================================================
// CaptionEditBox : กล่องเด้งสำหรับ เพิ่ม / แก้ไข แคปชั่น
//   ตั้งได้: ข้อความ, วันที่ + เวลาโพสต์ (ไม่ใส่วัน = เก็บในคลังสำรอง), แพลตฟอร์ม (เลือกได้หลายอัน), สถานะ, เตือน
//   <CaptionEditBox isOpen onClose />                    เพิ่มใหม่
//   <CaptionEditBox isOpen onClose caption={caption} />  แก้ไข
// =====================================================================
import { useEffect, useState, type FormEvent } from 'react'
import { todayAsText } from '@/shared/dateTools'
import { EmojiButton } from '@/shared/parts/EmojiButton'
import { PopupBox } from '@/shared/parts/PopupBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton } from '@/shared/parts/TagButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { addShopCaption, saveShopCaption } from '../../database'
import { CAPTION_STATUS_INFO, PLATFORM_LIST, type CaptionStatus, type NewCaption, type ShopCaption } from '../../types'

interface CaptionEditBoxProps {
  isOpen: boolean
  onClose: () => void
  /** ใส่มา = แก้ไขแคปชั่นนี้, ไม่ใส่ = เพิ่มใหม่ */
  caption?: ShopCaption
}

const STATUS_LIST: CaptionStatus[] = ['draft', 'ready', 'posted']

function makeEmptyForm(): NewCaption {
  return { text: '', postDate: todayAsText(), postTime: null, status: 'draft', platforms: [], remind: false }
}

export function CaptionEditBox({ isOpen, onClose, caption }: CaptionEditBoxProps) {
  const showMessage = useShowMessage()
  const [form, setForm] = useState<NewCaption>(makeEmptyForm)
  const [isSaving, setIsSaving] = useState(false)

  // ทุกครั้งที่เปิดกล่อง: เติมข้อมูลเดิม (หรือค่าเริ่มต้นถ้าเพิ่มใหม่)
  useEffect(() => {
    if (!isOpen) return
    setForm(
      caption
        ? {
            text: caption.text,
            postDate: caption.postDate,
            postTime: caption.postTime,
            status: caption.status,
            platforms: caption.platforms,
            remind: caption.remind,
          }
        : makeEmptyForm(),
    )
  }, [isOpen, caption])

  function changeForm(changes: Partial<NewCaption>) {
    setForm((oldForm) => ({ ...oldForm, ...changes }))
  }

  function togglePlatform(platformId: string) {
    changeForm({
      platforms: form.platforms.includes(platformId)
        ? form.platforms.filter((id) => id !== platformId)
        : [...form.platforms, platformId],
    })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!form.text.trim()) {
      showMessage('ใส่ข้อความแคปชั่นก่อนนะ', 'error')
      return
    }
    // ไม่มีวันที่ → ไม่มีเวลา และไม่เตือน (เก็บในคลังสำรอง)
    const cleanForm: NewCaption = form.postDate ? form : { ...form, postTime: null, remind: false }
    setIsSaving(true)
    try {
      if (caption) await saveShopCaption(caption.id, cleanForm)
      else await addShopCaption(cleanForm)
      showMessage(caption ? 'บันทึกแล้ว' : 'เพิ่มแคปชั่นแล้ว')
      onClose()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PopupBox isOpen={isOpen} title={caption ? 'แก้ไขแคปชั่น' : 'แคปชั่นใหม่'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <textarea
            className="text-input min-h-[140px] resize-y leading-relaxed"
            value={form.text}
            onChange={(event) => changeForm({ text: event.target.value })}
            placeholder="พิมพ์หรือวางแคปชั่นตรงนี้..."
            aria-label="ข้อความแคปชั่น"
            autoFocus={!caption}
          />
          <div className="mt-1 flex items-center justify-between">
            <EmojiButton onPick={(emoji) => changeForm({ text: form.text + emoji })} />
            <span className="font-typewriter text-xs text-soft">{Array.from(form.text).length} ตัวอักษร</span>
          </div>
        </div>

        {/* วันที่ + เวลา */}
        <div>
          <p className="small-label mb-2">วัน-เวลาที่จะโพสต์</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              className="text-input !w-auto"
              value={form.postDate ?? ''}
              onChange={(event) => changeForm({ postDate: event.target.value || null })}
              aria-label="วันที่โพสต์"
            />
            <input
              type="time"
              className="text-input !w-auto disabled:opacity-40"
              value={form.postTime ?? ''}
              onChange={(event) => changeForm({ postTime: event.target.value || null })}
              disabled={!form.postDate}
              aria-label="เวลาโพสต์"
            />
            {form.postDate && (
              <RoundButton look="ghost" size="small" onClick={() => changeForm({ postDate: null, postTime: null, remind: false })}>
                เก็บเข้าคลัง (ไม่กำหนดวัน)
              </RoundButton>
            )}
          </div>
          {!form.postDate && <p className="mt-1 text-sm text-soft">ยังไม่กำหนดวัน → อยู่ในคลังแคปชั่นสำรอง</p>}
        </div>

        {/* แพลตฟอร์ม */}
        <div>
          <p className="small-label mb-2">แพลตฟอร์ม (เลือกได้หลายอัน)</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_LIST.map((platform) => (
              <TagButton key={platform.id} isSelected={form.platforms.includes(platform.id)} onClick={() => togglePlatform(platform.id)}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: platform.color }} aria-hidden="true" />
                {platform.name}
              </TagButton>
            ))}
          </div>
        </div>

        {/* สถานะ */}
        <div>
          <p className="small-label mb-2">สถานะ</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_LIST.map((status) => (
              <TagButton key={status} isSelected={form.status === status} onClick={() => changeForm({ status })} emoji={CAPTION_STATUS_INFO[status].emoji}>
                {CAPTION_STATUS_INFO[status].name}
              </TagButton>
            ))}
          </div>
        </div>

        {/* เตือน */}
        <label className={`flex items-center gap-2 text-[15px] ${form.postDate ? 'text-ink' : 'text-soft/60'}`}>
          <input
            type="checkbox"
            className="h-5 w-5 accent-wine"
            checked={form.remind}
            disabled={!form.postDate}
            onChange={(event) => changeForm({ remind: event.target.checked })}
          />
          เตือนตอนถึงเวลาโพสต์ {form.postDate && !form.postTime && <span className="text-xs text-soft">(ไม่ระบุเวลา = เตือน 9:00)</span>}
        </label>

        <div className="flex justify-end">
          <RoundButton look="main" type="submit" disabled={isSaving}>
            บันทึก
          </RoundButton>
        </div>
      </form>
    </PopupBox>
  )
}

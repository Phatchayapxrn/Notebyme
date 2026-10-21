// =====================================================================
// MailsPage : หน้าเก็บเมล (/mails)
// ใส่เมลกับรหัสไว้เป็นชุดๆ แล้วโชว์เป็นการ์ดให้เลือก กดเปิดการ์ด → คัดลอกทีละช่องได้
// =====================================================================
import { useState, type ClipboardEvent } from 'react'
import { ClipboardPaste, Plus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { MAILS_TABLE, addMailSet, getAllMailSets, splitTextToValues } from '../database'
import { MailSetCard } from '../parts/MailSetCard'

export function MailsPage() {
  const showMessage = useShowMessage()
  const { items: sets, isLoading, errorText } = useLiveList({ tableName: MAILS_TABLE, getList: getAllMailSets })
  const [newSetId, setNewSetId] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')

  /** เพิ่มชุดใหม่ (ส่งข้อความมา = แยกบรรทัดเป็นช่องให้ / ไม่ส่ง = ช่องว่าง) */
  async function addSet(text?: string) {
    try {
      const nextOrder = sets.reduce((biggest, set) => Math.max(biggest, set.orderNumber), 0) + 1
      const values = text ? splitTextToValues(text) : []
      const fields = values.length > 0 ? values.map((value) => ({ label: '', value })) : undefined
      setNewSetId(await addMailSet(nextOrder, fields))
      if (fields) {
        setPasteText('')
        showMessage(`เพิ่มชุดแล้ว แยกได้ ${fields.length} ช่อง`)
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    }
  }

  /** วางข้อความในช่องว่าง → กลายเป็นชุดใหม่ทันที (ถ้าพิมพ์ค้างอยู่ จะวางต่อท้ายตามปกติ) */
  function whenPasted(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (pasteText.trim()) return
    const pastedText = event.clipboardData.getData('text/plain')
    if (splitTextToValues(pastedText).length === 0) return
    event.preventDefault()
    addSet(pastedText)
  }

  return (
    <>
      <PageTitle smallLabel="MAILS" title="เก็บเมล." underText="เมลกับรหัสแยกเป็นชุด กดคัดลอกไปใช้ต่อได้เลย" />

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}

      <div className="flex flex-col gap-3">
        {!isLoading && sets.length === 0 && (
          <EmptyMessage emoji="✉️" title="ยังไม่มีชุดเมล" text="กด “เพิ่มชุดใหม่” แล้วใส่เมลกับรหัสไว้ ครั้งหน้ากดคัดลอกได้ทันที" />
        )}
        {sets.map((set, index) => (
          <MailSetCard key={set.id} set={set} setNumber={index + 1} startEditing={set.id === newSetId} />
        ))}

        {/* ช่องวางข้อมูลทั้งชุด: 1 บรรทัด = 1 ช่องข้อมูล */}
        <div className="rounded-3xl border-2 border-dashed border-line bg-paper/60 p-3 transition focus-within:border-rose">
          <div className="mb-1 flex items-center gap-2 px-1 text-sm text-soft">
            <ClipboardPaste size={16} aria-hidden="true" />
            วางข้อมูลทั้งชุดตรงนี้ ระบบแยกช่องให้ตามบรรทัด (1 บรรทัด = 1 ช่อง)
          </div>
          <textarea
            className="block min-h-[80px] w-full resize-y bg-transparent px-1 py-1 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:outline-none"
            placeholder={'เช่น\nexample@hotmail.com\nรหัสผ่าน1234\nข้อมูลอื่นๆ'}
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            onPaste={whenPasted}
            aria-label="วางข้อมูลทั้งชุดเพื่อแยกช่องตามบรรทัด"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <RoundButton look="ghost" size="small" icon={<Plus size={15} />} onClick={() => addSet()}>
              ชุดว่าง
            </RoundButton>
            <RoundButton look="main" size="small" icon={<Plus size={15} />} onClick={() => addSet(pasteText)} disabled={!pasteText.trim()}>
              แยกช่องแล้วเพิ่มเป็นชุดใหม่
            </RoundButton>
          </div>
        </div>
      </div>
    </>
  )
}

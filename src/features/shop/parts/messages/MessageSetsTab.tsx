// =====================================================================
// MessageSetsTab : แท็บ "ชุดข้อความ" ในหน้าร้าน
//   - ด้านบน : จำนวนชุดทั้งหมด + ปุ่ม "คัดลอกทุกชุด"
//   - รายการชุดข้อความ (แต่ละชุดมีปุ่มคัดลอกมุมขวาบน)
//   - ด้านล่าง : ช่อง "วางข้อความ" → วาง 1 ครั้ง = ได้ชุดข้อความใหม่ 1 ชุด
//                (หรือพิมพ์แล้วกด "เพิ่มเป็นชุดใหม่" / กด "+ ชุดว่าง")
// ข้อความที่วาง จะถูกจัดบรรทัดให้ก่อน (บรรทัดว่างซ้อนกันหลายบรรทัด → เหลือ 1)
// =====================================================================
import { useState, type ClipboardEvent } from 'react'
import { ClipboardPaste, Plus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { CopyButton } from '@/shared/parts/CopyButton'
import { RoundButton } from '@/shared/parts/RoundButton'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { cleanText } from '@/shared/text/copyText'
import { MESSAGES_TABLE, addShopMessage, getAllShopMessages, swapShopMessages } from '../../database'
import { MessageSetBox } from './MessageSetBox'

export function MessageSetsTab() {
  const showMessage = useShowMessage()
  const { items: messages, isLoading } = useLiveList({ tableName: MESSAGES_TABLE, getList: getAllShopMessages })
  const [pasteText, setPasteText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  /** เลขลำดับถัดไป (ต่อท้ายสุด) */
  const nextOrderNumber = messages.reduce((biggest, message) => Math.max(biggest, message.orderNumber), 0) + 1

  /** เพิ่มชุดข้อความใหม่ */
  async function addNewSet(text: string) {
    setIsAdding(true)
    try {
      await addShopMessage({ text: cleanText(text), orderNumber: nextOrderNumber })
      showMessage(`เพิ่มชุดที่ ${messages.length + 1} แล้ว`)
      setPasteText('')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  /** วางข้อความในช่องว่าง → กลายเป็นชุดใหม่ทันที */
  function whenPasted(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (pasteText.trim()) return // มีข้อความพิมพ์ค้างอยู่ → วางต่อท้ายตามปกติ
    const pastedText = event.clipboardData.getData('text/plain')
    if (!pastedText.trim()) return
    event.preventDefault()
    addNewSet(pastedText)
  }

  async function swap(firstIndex: number, secondIndex: number) {
    try {
      await swapShopMessages(messages[firstIndex], messages[secondIndex])
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เลื่อนไม่สำเร็จ', 'error')
    }
  }

  /** ข้อความทุกชุดต่อกัน (คั่นแต่ละชุดด้วยบรรทัดว่าง 1 บรรทัด) */
  function getAllText() {
    return messages
      .map((message) => cleanText(message.text))
      .filter(Boolean)
      .join('\n\n')
  }

  if (isLoading) return <LoadingDots />

  return (
    <div className="flex flex-col gap-4">
      {/* แถวบน */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-typewriter text-sm text-soft">ทั้งหมด {messages.length} ชุดข้อความ</p>
        {messages.length > 1 && <CopyButton getText={getAllText} buttonText="คัดลอกทุกชุด" doneMessage="คัดลอกทุกชุดแล้ว" />}
      </div>

      {/* รายการชุดข้อความ */}
      {messages.length === 0 && (
        <EmptyMessage emoji="💬" title="ยังไม่มีชุดข้อความ" text="วางข้อความในช่องด้านล่าง ระบบจะเก็บเป็นชุดข้อความให้ กดคัดลอกไปใช้ได้ทุกเมื่อ" />
      )}
      {messages.map((message, index) => (
        <MessageSetBox
          key={message.id}
          message={message}
          setNumber={index + 1}
          onMoveUp={index > 0 ? () => swap(index, index - 1) : undefined}
          onMoveDown={index < messages.length - 1 ? () => swap(index, index + 1) : undefined}
        />
      ))}

      {/* ช่องวางข้อความ = เพิ่มชุดใหม่ */}
      <div className="rounded-3xl border-2 border-dashed border-line bg-paper/60 p-3 transition focus-within:border-rose">
        <div className="mb-1 flex items-center gap-2 px-1 text-sm text-soft">
          <ClipboardPaste size={16} aria-hidden="true" />
          วางข้อความตรงนี้ = เพิ่มเป็นชุดข้อความใหม่ทันที
        </div>
        <textarea
          className="block min-h-[80px] w-full resize-y bg-transparent px-1 py-1 text-[16px] leading-relaxed text-ink placeholder:text-soft/60 focus:outline-none"
          placeholder="กด Ctrl+V (มือถือ: กดค้าง > วาง) หรือพิมพ์เองก็ได้"
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          onPaste={whenPasted}
          aria-label="วางข้อความเพื่อเพิ่มชุดใหม่"
        />
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <RoundButton look="ghost" size="small" icon={<Plus size={15} />} onClick={() => addNewSet('')} disabled={isAdding}>
            ชุดว่าง
          </RoundButton>
          <RoundButton
            look="main"
            size="small"
            icon={<Plus size={15} />}
            onClick={() => addNewSet(pasteText)}
            disabled={isAdding || !pasteText.trim()}
          >
            เพิ่มเป็นชุดใหม่
          </RoundButton>
        </div>
      </div>
    </div>
  )
}
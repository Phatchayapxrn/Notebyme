// =====================================================================
// MailSetCard : การ์ดชุดเมล 1 ชุด
//   ปิด   : "ชุดที่ N" + "X ช่องข้อมูล" + ลูกศร (กดเพื่อเปิด)
//   เปิด  : ช่องข้อมูลทีละช่อง แต่ละช่องมีปุ่มคัดลอกมุมขวา
//   แก้ไข : แก้ชื่อชุด / ชื่อช่อง / ค่า เพิ่ม-ลบช่อง ลบทั้งชุด (กด "บันทึก" ถึงจะเก็บ)
// =====================================================================
import { useState, type ClipboardEvent } from 'react'
import { ChevronDown, Copy, Pencil, Plus, Trash2, X } from 'lucide-react'
import { RoundButton, IconButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { copyText } from '@/shared/text/copyText'
import { moveMailSetToTrash, saveMailSet, splitTextToValues } from '../database'
import type { MailField, MailSet } from '../types'

interface MailSetCardProps {
  set: MailSet
  /** ลำดับที่ (เริ่มที่ 1) */
  setNumber: number
  /** true = เปิดการ์ดและเข้าโหมดแก้ไขทันที (ชุดที่เพิ่งสร้าง) */
  startEditing?: boolean
}

/** ชื่อช่องที่โชว์ (ไม่ได้ตั้งชื่อ = "ข้อมูลช่องที่ N") */
function fieldName(field: MailField, index: number) {
  return field.label.trim() || `ข้อมูลช่องที่ ${index + 1}`
}

export function MailSetCard({ set, setNumber, startEditing = false }: MailSetCardProps) {
  const showMessage = useShowMessage()
  const [isOpen, setIsOpen] = useState(startEditing)
  const [isEditing, setIsEditing] = useState(startEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState(set.title)
  const [fields, setFields] = useState<MailField[]>(set.fields)

  /** คัดลอกค่าของช่องเดียว */
  async function copyField(field: MailField, index: number) {
    if (!field.value.trim()) {
      showMessage('ช่องนี้ยังว่างอยู่', 'error')
      return
    }
    const isSuccess = await copyText(field.value)
    if (isSuccess) showMessage(`คัดลอก${fieldName(field, index)}แล้ว`)
    else showMessage('คัดลอกไม่สำเร็จ ลองกดค้างที่ข้อความแล้วคัดลอกเองนะ', 'error')
  }

  function startEdit() {
    setTitle(set.title)
    setFields(set.fields)
    setIsOpen(true)
    setIsEditing(true)
  }

  function changeField(index: number, changes: Partial<MailField>) {
    setFields((oldFields) => oldFields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...changes } : field)))
  }

  /** วางหลายบรรทัดลงช่องค่า → บรรทัดแรกใส่ช่องนี้ บรรทัดถัดไปแทรกเป็นช่องใหม่ต่อจากช่องนี้ */
  function pasteIntoField(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const values = splitTextToValues(event.clipboardData.getData('text/plain'))
    if (values.length < 2) return // บรรทัดเดียว = วางตามปกติ
    event.preventDefault()
    setFields((oldFields) => [
      ...oldFields.slice(0, index),
      { ...oldFields[index], value: values[0] },
      ...values.slice(1).map((value) => ({ label: '', value })),
      ...oldFields.slice(index + 1),
    ])
    showMessage(`แยกเป็น ${values.length} ช่องแล้ว`)
  }

  async function save() {
    setIsSaving(true)
    try {
      await saveMailSet(set.id, { title: title.trim(), fields })
      setIsEditing(false)
      showMessage('บันทึกแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function moveToTrash() {
    try {
      await moveMailSetToTrash(set.id)
      showMessage('ย้ายไปถังขยะแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
      {/* หัวการ์ด : กดเพื่อเปิด/ปิด */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 px-5 py-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">
              ชุดที่ {setNumber}
              {set.title && <span className="font-normal text-soft"> · {set.title}</span>}
            </span>
            <span className="block text-sm text-soft">{set.fields.length} ช่องข้อมูล</span>
          </span>
          <ChevronDown size={20} className={`flex-none text-soft transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {isOpen && !isEditing && (
          <IconButton label="แก้ไขชุดนี้" onClick={startEdit} className="mr-3">
            <Pencil size={17} />
          </IconButton>
        )}
      </div>

      {isOpen && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          {/* โหมดดู : ช่องละกล่อง + ปุ่มคัดลอก */}
          {!isEditing && (
            <div className="flex flex-col gap-4">
              {set.fields.length === 0 && <p className="text-sm text-soft">ยังไม่มีช่องข้อมูล กดดินสอเพื่อแก้ไข</p>}
              {set.fields.map((field, index) => (
                <div key={index}>
                  <p className="mb-1.5 text-sm font-semibold text-soft">{fieldName(field, index)}</p>
                  <div className="flex items-center gap-2 rounded-2xl bg-blush/60 py-2 pl-4 pr-2">
                    <p className="min-w-0 flex-1 select-all break-all font-mono text-[15px] text-ink">
                      {field.value || <span className="text-soft/50">(ว่าง)</span>}
                    </p>
                    <IconButton label={`คัดลอก${fieldName(field, index)}`} onClick={() => copyField(field, index)}>
                      <Copy size={18} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* โหมดแก้ไข */}
          {isEditing && (
            <div className="flex flex-col gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-soft">ชื่อชุด (ไม่ใส่ก็ได้)</span>
                <input className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} />
              </label>

              {fields.map((field, index) => (
                <div key={index} className="rounded-2xl border border-line p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      className="text-input min-w-0 flex-1"
                      placeholder={`ชื่อช่อง (เช่น อีเมล) — ว่าง = ข้อมูลช่องที่ ${index + 1}`}
                      value={field.label}
                      onChange={(event) => changeField(index, { label: event.target.value })}
                      aria-label={`ชื่อช่องที่ ${index + 1}`}
                      maxLength={60}
                    />
                    <IconButton
                      label={`ลบช่องที่ ${index + 1}`}
                      onClick={() => setFields((oldFields) => oldFields.filter((_, fieldIndex) => fieldIndex !== index))}
                    >
                      <X size={17} />
                    </IconButton>
                  </div>
                  <input
                    className="text-input font-mono"
                    placeholder="ค่า (สิ่งที่จะคัดลอก)"
                    value={field.value}
                    onChange={(event) => changeField(index, { value: event.target.value })}
                    onPaste={(event) => pasteIntoField(event, index)}
                    aria-label={`ค่าช่องที่ ${index + 1}`}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              ))}

              <RoundButton look="ghost" size="small" icon={<Plus size={15} />} onClick={() => setFields((oldFields) => [...oldFields, { label: '', value: '' }])}>
                เพิ่มช่อง
              </RoundButton>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <RoundButton look="danger" size="small" icon={<Trash2 size={15} />} onClick={moveToTrash}>
                  ลบชุดนี้
                </RoundButton>
                <div className="flex gap-2">
                  <RoundButton look="ghost" size="small" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    ยกเลิก
                  </RoundButton>
                  <RoundButton look="main" size="small" onClick={save} disabled={isSaving}>
                    บันทึก
                  </RoundButton>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

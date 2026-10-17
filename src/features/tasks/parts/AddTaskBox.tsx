// =====================================================================
// AddTaskBox : กล่องเพิ่มงานใหม่ (แบบรูป "Add a task... + ADD")
// เลือกได้: หมวด / ความสำคัญ / วันกำหนดส่ง
// =====================================================================
import { useState, type FormEvent } from 'react'
import { Plus, CalendarDays, X } from 'lucide-react'
import { GroupPicker } from '@/shared/groups/GroupPicker'
import { RoundButton } from '@/shared/parts/RoundButton'
import { TagButton } from '@/shared/parts/TagButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { showDueText } from '@/shared/dateTools'
import { addNewTask } from '../database'
import { IMPORTANCE_INFO, type Importance } from '../types'

export function AddTaskBox() {
  const showMessage = useShowMessage()
  const [text, setText] = useState('')
  const [groupId, setGroupId] = useState<string | null>(null)
  const [importance, setImportance] = useState<Importance>('medium')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  async function addTask(event: FormEvent) {
    event.preventDefault()
    const taskText = text.trim()
    if (!taskText) return
    setIsAdding(true)
    try {
      await addNewTask({ text: taskText, groupId, importance, dueDate })
      setText('') // ล้างช่อง แต่จำหมวด/ความสำคัญไว้ เผื่อเพิ่มต่อ
      setDueDate(null)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มงานไม่สำเร็จ', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <form onSubmit={addTask} className="flex flex-col gap-4 rounded-3xl border-[1.5px] border-line bg-paper p-4 shadow-soft sm:p-6">
      {/* ช่องพิมพ์ + ปุ่มเพิ่ม */}
      <div className="flex gap-3">
        <input
          className="text-input flex-1 font-title text-lg"
          placeholder="เพิ่มงาน..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="ข้อความงานใหม่"
          maxLength={300}
        />
        <RoundButton look="main" size="big" type="submit" disabled={isAdding || !text.trim()} icon={<Plus size={20} />} className="px-5 sm:px-7">
          <span className="hidden sm:inline">เพิ่ม</span>
        </RoundButton>
      </div>

      {/* หมวด */}
      <GroupPicker selectedGroupId={groupId} onSelect={setGroupId} />

      {/* ความสำคัญ + วันกำหนดส่ง */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(IMPORTANCE_INFO) as Importance[]).map((level) => (
          <TagButton
            key={level}
            isSelected={importance === level}
            onClick={() => setImportance(level)}
            colorClass={level === 'high' ? 'text-danger' : ''}
          >
            {IMPORTANCE_INFO[level].name}
          </TagButton>
        ))}
        <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
        <label className="relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-2 border-line bg-paper px-3.5 text-sm text-ink hover:border-pink">
          <CalendarDays size={15} aria-hidden="true" />
          {dueDate ? showDueText(dueDate) : 'กำหนดส่ง'}
          <input
            type="date"
            aria-label="วันกำหนดส่ง"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={dueDate ?? ''}
            onChange={(event) => setDueDate(event.target.value || null)}
          />
        </label>
        {dueDate && (
          <button type="button" onClick={() => setDueDate(null)} aria-label="ไม่กำหนดวันส่ง" className="grid h-8 w-8 place-items-center rounded-full text-soft hover:bg-blush">
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  )
}

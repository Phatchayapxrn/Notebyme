// =====================================================================
// TaskRow : งาน 1 แถว (วงกลมติ๊กเสร็จ / ข้อความ / หมวด / ความสำคัญ / กำหนดส่ง)
// กดที่ข้อความเพื่อแก้ไขได้ (กด Enter หรือคลิกที่อื่นเพื่อบันทึก)
// =====================================================================
import { useState } from 'react'
import { Check, CalendarPlus, Trash2 } from 'lucide-react'
import { showDueText, daysUntil } from '@/shared/dateTools'
import type { Group } from '@/shared/groups/groupTypes'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { markTaskDone, moveTaskToTrash, saveTask } from '../database'
import { IMPORTANCE_INFO, type Task } from '../types'

interface TaskRowProps {
  task: Task
  group?: Group
  /** แบบย่อ (ไม่มีปุ่มแก้ไข) ใช้ในหน้าแรก/แถบขวา */
  isSmall?: boolean
}

export function TaskRow({ task, group, isSmall = false }: TaskRowProps) {
  const showMessage = useShowMessage()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const isLate = !task.isDone && task.dueDate !== null && daysUntil(task.dueDate) < 0

  /** ทำงาน แล้วถ้าพลาดให้เด้งข้อความเตือน */
  async function tryTo(action: () => Promise<void>, successText?: string) {
    try {
      await action()
      if (successText) showMessage(successText)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ทำไม่สำเร็จ', 'error')
    }
  }

  function finishEditing() {
    setIsEditing(false)
    const newText = editText.trim()
    if (newText && newText !== task.text) tryTo(() => saveTask(task.id, { text: newText }))
    else setEditText(task.text)
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-[1.5px] border-line bg-paper transition ${isSmall ? 'px-3 py-2.5' : 'px-4 py-3.5 shadow-soft'} ${task.isDone ? 'opacity-60' : ''}`}
    >
      {/* วงกลมติ๊กเสร็จ */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.isDone}
        aria-label={task.isDone ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
        onClick={() => tryTo(() => markTaskDone(task.id, !task.isDone))}
        className={`grid flex-none place-items-center rounded-full border-2 transition ${isSmall ? 'h-6 w-6' : 'h-8 w-8'} ${
          task.isDone ? 'border-wine bg-wine text-paper' : 'border-pink hover:border-rose hover:bg-blush'
        }`}
      >
        {task.isDone && <Check size={isSmall ? 14 : 18} strokeWidth={3} />}
      </button>

      {/* ข้อความ + ข้อมูลย่อย */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            className="w-full rounded-lg border-2 border-rose bg-paper px-2 py-1 text-[16px] focus:outline-none"
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            onBlur={finishEditing}
            onKeyDown={(event) => {
              if (event.key === 'Enter') finishEditing()
              if (event.key === 'Escape') {
                setEditText(task.text)
                setIsEditing(false)
              }
            }}
            autoFocus
            aria-label="แก้ข้อความงาน"
          />
        ) : (
          <button
            type="button"
            onClick={() => !isSmall && setIsEditing(true)}
            className={`block w-full text-left font-title text-[17px] leading-snug ${task.isDone ? 'text-soft line-through' : 'text-ink'} ${isSmall ? 'cursor-default truncate text-[15px]' : ''}`}
          >
            {task.text}
          </button>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {group && (
            <span className="uppercase tracking-wider text-soft">
              {group.emoji} {group.name}
            </span>
          )}
          {!isSmall && (
            <span className={`rounded-md px-2 py-0.5 ${IMPORTANCE_INFO[task.importance].badgeClass}`}>
              {IMPORTANCE_INFO[task.importance].name}
            </span>
          )}
          {task.dueDate && (
            <span className={`font-typewriter ${isLate ? 'text-danger' : 'text-soft'}`}>{showDueText(task.dueDate)}</span>
          )}
        </div>
      </div>

      {/* ปุ่มด้านขวา */}
      {!isSmall && (
        <div className="flex flex-none items-center">
          {/* ตั้งวันกำหนดส่ง: ช่องเลือกวันที่ซ่อนทับปุ่มไว้ (กดได้ทั้งในคอมและมือถือ) */}
          <label className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full text-soft hover:bg-blush hover:text-ink" title="ตั้งวันกำหนดส่ง">
            <CalendarPlus size={19} aria-hidden="true" />
            <input
              type="date"
              aria-label="ตั้งวันกำหนดส่ง"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={task.dueDate ?? ''}
              onChange={(event) => tryTo(() => saveTask(task.id, { dueDate: event.target.value || null }))}
            />
          </label>
          <button
            type="button"
            aria-label="ย้ายไปถังขยะ"
            title="ย้ายไปถังขยะ"
            onClick={() => tryTo(() => moveTaskToTrash(task.id), 'ย้ายไปถังขยะแล้ว')}
            className="grid h-10 w-10 place-items-center rounded-full text-soft hover:bg-blush hover:text-ink"
          >
            <Trash2 size={19} />
          </button>
        </div>
      )}
    </div>
  )
}

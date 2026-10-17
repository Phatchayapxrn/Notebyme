// =====================================================================
// GroupManager : จัดการหมวดหมู่ (เพิ่ม / แก้ไข / เลื่อนลำดับ / ลบ)
// ใช้ในหน้าตั้งค่า
// =====================================================================
import { useState } from 'react'
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react'
import { useGroups } from '@/shared/groups/useGroups'
import { GroupEditBox } from '@/shared/groups/GroupEditBox'
import { GroupCover } from '@/shared/groups/GroupCover'
import { deleteGroup, saveGroupOrder } from '@/shared/groups/groupDatabase'
import type { Group } from '@/shared/groups/groupTypes'
import { IconButton, RoundButton } from '@/shared/parts/RoundButton'
import { ConfirmBox } from '@/shared/parts/PopupBox'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { useShowMessage } from '@/shared/parts/PopupMessage'

export function GroupManager() {
  const { groups } = useGroups()
  const showMessage = useShowMessage()
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>()
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)

  function openEditBox(group?: Group) {
    setGroupToEdit(group)
    setIsEditBoxOpen(true)
  }

  /** เลื่อนหมวดขึ้น (-1) หรือลง (+1) */
  async function moveGroup(index: number, direction: -1 | 1) {
    const newOrder = groups.map((group) => group.id)
    const otherIndex = index + direction
    ;[newOrder[index], newOrder[otherIndex]] = [newOrder[otherIndex], newOrder[index]]
    try {
      await saveGroupOrder(newOrder)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เลื่อนไม่สำเร็จ', 'error')
    }
  }

  async function confirmDelete(group: Group) {
    try {
      await deleteGroup(group)
      showMessage(`ลบหมวด "${group.name}" แล้ว`)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.length === 0 ? (
        <EmptyMessage emoji="🗂️" title="ยังไม่มีหมวด" text="สร้างหมวดไว้แยกไอเดียและงานเป็นกลุ่มๆ" />
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-2xl border-[1.5px] border-line">
          {groups.map((group, index) => (
            <li key={group.id} className="flex items-center gap-3 px-3 py-2.5">
              <GroupCover coverPicture={group.coverPicture} color={group.color} className="h-10 w-10 flex-none rounded-xl border border-line" />
              <span className="min-w-0 flex-1 truncate font-cute text-[15px]">
                {group.emoji} {group.name}
              </span>
              <IconButton label="เลื่อนขึ้น" onClick={() => moveGroup(index, -1)} disabled={index === 0} className="h-8 w-8">
                <ChevronUp size={18} />
              </IconButton>
              <IconButton label="เลื่อนลง" onClick={() => moveGroup(index, 1)} disabled={index === groups.length - 1} className="h-8 w-8">
                <ChevronDown size={18} />
              </IconButton>
              <IconButton label="แก้ไขหมวด" onClick={() => openEditBox(group)} className="h-8 w-8">
                <Pencil size={16} />
              </IconButton>
              <IconButton label="ลบหมวด" onClick={() => setGroupToDelete(group)} className="h-8 w-8 hover:text-danger">
                <Trash2 size={16} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <RoundButton look="pink" icon={<Plus size={17} />} onClick={() => openEditBox()} className="self-start">
        หมวดใหม่
      </RoundButton>

      <GroupEditBox isOpen={isEditBoxOpen} group={groupToEdit} onClose={() => setIsEditBoxOpen(false)} />
      <ConfirmBox
        isOpen={groupToDelete !== null}
        title="ลบหมวดนี้?"
        text={`ลบหมวด "${groupToDelete?.name}" แล้ว ไอเดียและงานในหมวดนี้จะไม่หาย แค่กลายเป็น "ไม่มีหมวด"`}
        confirmText="ลบหมวด"
        isDanger
        onConfirm={() => groupToDelete && confirmDelete(groupToDelete)}
        onClose={() => setGroupToDelete(null)}
      />
    </div>
  )
}

// =====================================================================
// GroupPicker : แถวปุ่มเลือกหมวด (ใช้ตอนจะใส่โน๊ต/งาน ลงหมวดไหน)
// ใช้งาน: <GroupPicker selectedGroupId={groupId} onSelect={setGroupId} />
// =====================================================================
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import type { GroupKind } from './groupTypes'
import { useGroups } from './useGroups'

interface GroupPickerProps {
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
  /** แสดงปุ่ม "ไม่มีหมวด" ด้วยไหม (ค่าเริ่มต้น แสดง) */
  showNoGroup?: boolean
  /** หมวดชนิดไหน (ค่าเริ่มต้น = ของไอเดีย/งาน) */
  kind?: GroupKind
}

export function GroupPicker({ selectedGroupId, onSelect, showNoGroup = true, kind = 'general' }: GroupPickerProps) {
  const { groups } = useGroups(kind)
  return (
    <TagRow>
      {showNoGroup && (
        <TagButton isSelected={selectedGroupId === null} onClick={() => onSelect(null)}>
          ไม่มีหมวด
        </TagButton>
      )}
      {groups.map((group) => (
        <TagButton
          key={group.id}
          emoji={group.emoji}
          isSelected={selectedGroupId === group.id}
          onClick={() => onSelect(group.id)}
        >
          {group.name}
        </TagButton>
      ))}
    </TagRow>
  )
}

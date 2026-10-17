// =====================================================================
// GroupPicker : แถวปุ่มเลือกหมวด (ใช้ตอนจะใส่โน๊ต/งาน ลงหมวดไหน)
// ใช้งาน: <GroupPicker selectedGroupId={groupId} onSelect={setGroupId} />
// =====================================================================
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { useGroups } from './useGroups'

interface GroupPickerProps {
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
  /** แสดงปุ่ม "ไม่มีหมวด" ด้วยไหม (ค่าเริ่มต้น แสดง) */
  showNoGroup?: boolean
}

export function GroupPicker({ selectedGroupId, onSelect, showNoGroup = true }: GroupPickerProps) {
  const { groups } = useGroups()
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

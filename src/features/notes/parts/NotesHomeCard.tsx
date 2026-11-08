// =====================================================================
// NotesHomeCard : ส่วนของ "ไอเดีย" ที่ไปโชว์ในหน้าแรก
//   การ์ดหมวดหมู่ทั้งหมด + จำนวนไอเดียในแต่ละหมวด (กดแล้วไปดูหมวดนั้น)
// =====================================================================
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { useGroups } from '@/shared/groups/useGroups'
import { GroupCard } from '@/shared/groups/GroupCard'
import { GroupEditBox } from '@/shared/groups/GroupEditBox'
import { getAllNotes } from '../database'

export function NotesHomeCard() {
  const navigate = useNavigate()
  const { items: notes } = useLiveList({ tableName: 'notes', getList: getAllNotes })
  const { groups } = useGroups()
  const [isGroupBoxOpen, setIsGroupBoxOpen] = useState(false)

  /** จำนวนไอเดียในแต่ละหมวด */
  const countByGroup = useMemo(() => {
    const counts = new Map<string, number>()
    notes.forEach((note) => note.groupId && counts.set(note.groupId, (counts.get(note.groupId) ?? 0) + 1))
    return counts
  }, [notes])

  return (
    <div className="flex flex-col gap-8">
      {/* หมวดหมู่ */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="small-label">หมวดหมู่ไอเดีย</h2>
          <span className="font-typewriter text-xs text-soft">ทั้งหมด {notes.length} ไอเดีย</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              countText={`${countByGroup.get(group.id) ?? 0} ไอเดีย`}
              onClick={() => navigate(`/notes?group=${group.id}`)}
            />
          ))}
          <button
            type="button"
            onClick={() => setIsGroupBoxOpen(true)}
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-soft transition hover:border-rose hover:text-ink"
          >
            <Plus size={22} />
            <span className="text-sm">หมวดใหม่</span>
          </button>
        </div>
      </section>

      <GroupEditBox isOpen={isGroupBoxOpen} onClose={() => setIsGroupBoxOpen(false)} />
    </div>
  )
}

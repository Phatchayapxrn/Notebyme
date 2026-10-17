// =====================================================================
// TasksPage : หน้าสิ่งที่ต้องทำ (/tasks) หน้าตาแบบรูป "To-do."
// - กล่องเพิ่มงานด้านบน
// - กรองตามหมวด + เลือกว่าจะแสดงงานที่เสร็จแล้วไหม
// - งานเรียง: ใกล้กำหนดส่งก่อน / สำคัญมากก่อน
// =====================================================================
import { useMemo, useState } from 'react'
import { useLiveList } from '@/shared/data/useLiveList'
import { useGroups } from '@/shared/groups/useGroups'
import { PageTitle } from '@/shared/parts/PageTitle'
import { TagButton, TagRow } from '@/shared/parts/TagButton'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { getAllTasks, sortTasks } from '../database'
import { AddTaskBox } from '../parts/AddTaskBox'
import { TaskRow } from '../parts/TaskRow'

export function TasksPage() {
  const { items: tasks, isLoading } = useLiveList({ tableName: 'tasks', getList: getAllTasks })
  const { groups, findGroup } = useGroups()
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [isShowingDone, setIsShowingDone] = useState(false)

  const shownTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (!isShowingDone && task.isDone) return false
      if (selectedGroup === 'all') return true
      if (selectedGroup === 'none') return task.groupId === null
      return task.groupId === selectedGroup
    })
    return sortTasks(filtered)
  }, [tasks, selectedGroup, isShowingDone])

  const doneCount = tasks.filter((task) => task.isDone).length
  const notDoneTasks = shownTasks.filter((task) => !task.isDone)
  const doneTasks = shownTasks.filter((task) => task.isDone)

  return (
    <>
      <PageTitle smallLabel="CAPTURE" title="สิ่งที่ต้องทำ." underText="จดไว้ก่อน ไม่ต้องกดดันตัวเอง" />

      <AddTaskBox />

      {/* กรอง */}
      <div className="mb-4 mt-7 flex flex-col gap-3">
        <TagRow>
          <TagButton look="flat" isSelected={selectedGroup === 'all'} onClick={() => setSelectedGroup('all')}>
            ทั้งหมด
          </TagButton>
          {groups.map((group) => (
            <TagButton
              key={group.id}
              look="flat"
              emoji={group.emoji}
              isSelected={selectedGroup === group.id}
              onClick={() => setSelectedGroup(group.id)}
            >
              {group.name}
            </TagButton>
          ))}
          <TagButton look="flat" isSelected={selectedGroup === 'none'} onClick={() => setSelectedGroup('none')}>
            ไม่มีหมวด
          </TagButton>
        </TagRow>
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm uppercase tracking-wider text-soft">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer rounded accent-wine"
            checked={isShowingDone}
            onChange={(event) => setIsShowingDone(event.target.checked)}
          />
          แสดงที่เสร็จแล้ว ({doneCount})
        </label>
      </div>

      {/* รายการงาน */}
      {isLoading ? (
        <LoadingDots />
      ) : shownTasks.length === 0 ? (
        <EmptyMessage emoji="🎀" title="ไม่มีงานค้าง" text="พิมพ์งานในกล่องด้านบน แล้วกด เพิ่ม" />
      ) : (
        <div className="flex flex-col gap-3">
          {notDoneTasks.map((task) => (
            <TaskRow key={task.id} task={task} group={findGroup(task.groupId)} />
          ))}
          {doneTasks.length > 0 && (
            <>
              <h2 className="small-label mt-4">เสร็จแล้ว</h2>
              {doneTasks.map((task) => (
                <TaskRow key={task.id} task={task} group={findGroup(task.groupId)} />
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}

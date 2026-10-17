// =====================================================================
// TasksSummaryCard : สรุปงาน (วงกลม % + งานที่ใกล้กำหนดส่ง)
// ใช้ 2 ที่: หน้าแรก (homeCard) และแถบขวาบนจอคอม (sideCard)
// =====================================================================
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { useGroups } from '@/shared/groups/useGroups'
import { DonePercentCircle } from '@/shared/parts/DonePercentCircle'
import { WindowBox } from '@/shared/parts/WindowBox'
import { getAllTasks, sortTasks } from '../database'
import { TaskRow } from './TaskRow'

export function TasksSummaryCard() {
  const { items: tasks } = useLiveList({ tableName: 'tasks', getList: getAllTasks })
  const { findGroup } = useGroups()
  const doneCount = tasks.filter((task) => task.isDone).length
  const nextTasks = sortTasks(tasks.filter((task) => !task.isDone)).slice(0, 5)

  return (
    <WindowBox title="tasks.exe" insideClassName="flex flex-col items-center gap-4 p-4">
      <DonePercentCircle doneCount={doneCount} allCount={tasks.length} />
      <div className="flex w-full flex-col gap-2">
        <h2 className="small-label">งานถัดไป</h2>
        {nextTasks.length === 0 ? (
          <p className="py-2 text-center text-sm text-soft">ไม่มีงานค้าง เย้! 🎉</p>
        ) : (
          nextTasks.map((task) => <TaskRow key={task.id} task={task} group={findGroup(task.groupId)} isSmall />)
        )}
      </div>
      <Link to="/tasks" className="flex items-center gap-1 self-end text-sm text-wine hover:underline">
        ไปหน้างานทั้งหมด <ArrowRight size={14} />
      </Link>
    </WindowBox>
  )
}

/** เวอร์ชันหน้าแรก: ซ่อนบนจอคอมกว้าง เพราะมีในแถบขวาอยู่แล้ว */
export function TasksHomeCard() {
  return (
    <div className="xl:hidden">
      <TasksSummaryCard />
    </div>
  )
}

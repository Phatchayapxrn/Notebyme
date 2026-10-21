// =====================================================================
// search.ts (tasks) : ค้นหาในสิ่งที่ต้องทำ ให้ช่องค้นหากลาง
// =====================================================================
import type { SearchResult } from '../AppFeature'
import { MAX_RESULTS_PER_FEATURE, isMatch } from '@/shared/search/searchTools'
import { getAllTasks } from './database'

export async function searchTasks(keyword: string): Promise<SearchResult[]> {
  const tasks = await getAllTasks()
  return tasks
    .filter((task) => isMatch(keyword, task.text))
    .slice(0, MAX_RESULTS_PER_FEATURE)
    .map((task) => ({ id: task.id, title: task.text, previewText: task.isDone ? 'ทำแล้ว' : undefined, link: '/tasks' }))
}

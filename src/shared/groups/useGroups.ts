// =====================================================================
// useGroups : ดึงหมวดหมู่ทั้งหมด (อัปเดตสด)
// ใช้งาน: const { groups, findGroup } = useGroups()
// =====================================================================
import { useCallback } from 'react'
import { useLiveList } from '@/shared/data/useLiveList'
import { getAllGroups } from './groupDatabase'

export function useGroups() {
  const { items: groups, isLoading } = useLiveList({ tableName: 'groups', getList: getAllGroups })

  /** หาหมวดจาก id (ไม่เจอ = undefined) */
  const findGroup = useCallback(
    (groupId: string | null | undefined) => (groupId ? groups.find((group) => group.id === groupId) : undefined),
    [groups],
  )

  return { groups, isLoading, findGroup }
}

// =====================================================================
// useLiveList : ดึงรายการจากฐานข้อมูล + อัปเดตสดเมื่อข้อมูลเปลี่ยน
//
// ใช้งาน:
//   const { items, isLoading } = useLiveList({ tableName: 'notes', getList: getAllNotes })
//
// อัปเดตเมื่อไหร่บ้าง:
//   1) ข้อมูลในตารางเปลี่ยน จากเครื่องอื่นหรือแท็บอื่น (ผ่าน Supabase Realtime)
//   2) เครื่องนี้เรียก tellListChanged('notes') หลังจากเพิ่ม/แก้/ลบ
// =====================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { database } from '@/shared/database'
import { useLogin } from '@/shared/login/LoginProvider'

interface LiveListSettings<Item> {
  /** ชื่อตารางในฐานข้อมูล เช่น 'notes' */
  tableName: string
  /** ฟังก์ชันที่ดึงรายการ */
  getList: () => Promise<Item[]>
}

export function useLiveList<Item>({ tableName, getList }: LiveListSettings<Item>) {
  const { user } = useLogin()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  // เก็บฟังก์ชันล่าสุดไว้ จะได้ไม่ต้องสมัครฟัง realtime ใหม่ทุกครั้งที่หน้าจอวาดใหม่
  const getListRef = useRef(getList)
  getListRef.current = getList

  /** โหลดรายการใหม่จากฐานข้อมูล */
  const loadAgain = useCallback(async () => {
    try {
      const newItems = await getListRef.current()
      setItems(newItems)
      setErrorText(null)
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadAgain()

    // ถ้ามีการเปลี่ยนแปลงติดๆ กันหลายครั้ง ให้รอแป๊บแล้วโหลดทีเดียว
    let waitTimer: number | undefined
    const loadAgainSoon = () => {
      window.clearTimeout(waitTimer)
      waitTimer = window.setTimeout(loadAgain, 150)
    }

    // (1) ฟังการเปลี่ยนแปลงจากเครื่องอื่น
    const channel = database
      .channel(`live-${tableName}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, filter: `user_id=eq.${user.id}` },
        loadAgainSoon,
      )
      .subscribe()

    // (2) ฟังการเปลี่ยนแปลงจากเครื่องนี้เอง
    const whenListChanged = (event: Event) => {
      if ((event as CustomEvent<string>).detail === tableName) loadAgainSoon()
    }
    window.addEventListener('list-changed', whenListChanged)

    return () => {
      window.clearTimeout(waitTimer)
      window.removeEventListener('list-changed', whenListChanged)
      database.removeChannel(channel)
    }
  }, [user, tableName, loadAgain])

  return { items, isLoading, errorText, loadAgain }
}

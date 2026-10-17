// =====================================================================
// LoginProvider : จำว่าตอนนี้ใครล็อกอินอยู่ แล้วแชร์ให้ทุกหน้าใช้
// ใช้งาน: ในหน้าไหนก็ได้ เรียก const { user } = useLogin()
// =====================================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { database } from '@/shared/database'

interface LoginInfo {
  /** ผู้ใช้ที่ล็อกอินอยู่ (null = ยังไม่ล็อกอิน) */
  user: User | null
  /** true = กำลังเช็คว่าล็อกอินอยู่ไหม (ตอนเพิ่งเปิดเว็บ) */
  isChecking: boolean
}

const LoginContext = createContext<LoginInfo>({ user: null, isChecking: true })

/** ครอบทั้งแอพไว้ เพื่อให้ทุกหน้ารู้ว่าใครล็อกอินอยู่ */
export function LoginProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // เช็คครั้งแรกตอนเปิดเว็บ
    database.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setIsChecking(false)
    })
    // ฟังทุกครั้งที่ล็อกอิน / ออกจากระบบ
    const { data: listener } = database.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return <LoginContext.Provider value={{ user, isChecking }}>{children}</LoginContext.Provider>
}

/** ดูว่าใครล็อกอินอยู่ */
export function useLogin() {
  return useContext(LoginContext)
}

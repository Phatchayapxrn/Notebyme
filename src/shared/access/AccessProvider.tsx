// =====================================================================
// AccessProvider : จำว่าคนที่ล็อกอินอยู่ เห็นระบบไหนได้บ้าง แล้วแชร์ให้ทุกหน้าใช้
//
// ใช้งาน:
//   const { isAdmin, canSee } = useAccess()
//   canSee('shop')  // true = เห็นระบบร้านได้
//
//   <FeatureGate featureId="shop"><ShopPage /></FeatureGate>
//     → ไม่มีสิทธิ์ = พากลับหน้าแรก (กันคนพิมพ์ลิงก์ /shop เข้ามาตรงๆ)
//
// - จำผลล่าสุดไว้ในเครื่อง เปิดเว็บครั้งต่อไปเมนูจะไม่กระพริบ
// - ถ้ายังไม่ได้รัน 004_roles.sql = ทุกคนเห็นทุกระบบ (เหมือนก่อนมีระบบยศ)
// - เช็คใหม่ทุกครั้งที่กลับมาเปิดแอพ (แอดมินเปลี่ยนสิทธิ์ อีกคนจะเห็นผลเมื่อสลับกลับมา)
// =====================================================================
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useLogin } from '@/shared/login/LoginProvider'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { getMyAccess, type MyAccess } from './accessDatabase'

interface AccessInfo extends MyAccess {
  /** true = กำลังเช็คสิทธิ์ครั้งแรก */
  isLoading: boolean
  /** false = ยังไม่ได้รัน 004_roles.sql */
  isSetUp: boolean
  /** เห็นระบบนี้ได้ไหม */
  canSee: (featureId: string) => boolean
  /** เช็คสิทธิ์ใหม่ (เรียกหลังแอดมินแก้ค่า) */
  loadAgain: () => Promise<void>
}

const AccessContext = createContext<AccessInfo>({
  isAdmin: false,
  hiddenFeatures: [],
  isLoading: true,
  isSetUp: false,
  canSee: () => true,
  loadAgain: async () => {},
})

/** ชื่อที่เก็บผลล่าสุดไว้ในเครื่อง (แยกตามผู้ใช้) */
function saveName(userId: string) {
  return `access:${userId}`
}

function getSavedAccess(userId: string): MyAccess | null {
  try {
    const text = localStorage.getItem(saveName(userId))
    return text ? (JSON.parse(text) as MyAccess) : null
  } catch {
    return null
  }
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useLogin()
  const [access, setAccess] = useState<MyAccess>({ isAdmin: false, hiddenFeatures: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSetUp, setIsSetUp] = useState(false)
  const userId = user?.id

  const loadAgain = useCallback(async () => {
    if (!userId) return
    try {
      const newAccess = await getMyAccess()
      setAccess(newAccess)
      setIsSetUp(true)
      try {
        localStorage.setItem(saveName(userId), JSON.stringify(newAccess))
      } catch {
        // จำไม่ได้ก็ไม่เป็นไร
      }
    } catch {
      // ยังไม่ได้รัน 004_roles.sql (หรือเน็ตหลุด) → ใช้ผลที่จำไว้ / ถ้าไม่มี = เห็นทุกระบบ
      setAccess(getSavedAccess(userId) ?? { isAdmin: false, hiddenFeatures: [] })
      setIsSetUp(false)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setAccess({ isAdmin: false, hiddenFeatures: [] })
      setIsLoading(true)
      return
    }
    // ใช้ผลที่จำไว้ก่อน (เมนูขึ้นทันที) แล้วค่อยเช็คจริง
    const savedAccess = getSavedAccess(userId)
    if (savedAccess) {
      setAccess(savedAccess)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    loadAgain()

    const whenPageShown = () => {
      if (document.visibilityState === 'visible') loadAgain()
    }
    document.addEventListener('visibilitychange', whenPageShown)
    return () => document.removeEventListener('visibilitychange', whenPageShown)
  }, [userId, loadAgain])

  const canSee = useCallback((featureId: string) => !access.hiddenFeatures.includes(featureId), [access.hiddenFeatures])

  return (
    <AccessContext.Provider value={{ ...access, isLoading, isSetUp, canSee, loadAgain }}>{children}</AccessContext.Provider>
  )
}

/** ดูสิทธิ์ของคนที่ล็อกอินอยู่ */
export function useAccess() {
  return useContext(AccessContext)
}

/** ครอบหน้าของระบบ : ไม่มีสิทธิ์ = พากลับหน้าแรก */
export function FeatureGate({ featureId, children }: { featureId: string; children: ReactNode }) {
  const { isLoading, canSee } = useAccess()
  if (isLoading) return <LoadingDots />
  if (!canSee(featureId)) return <Navigate to="/" replace />
  return <>{children}</>
}
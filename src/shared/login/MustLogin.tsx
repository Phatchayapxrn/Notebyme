// =====================================================================
// MustLogin : ครอบหน้าที่ต้องล็อกอินก่อนถึงจะเข้าได้
// ถ้ายังไม่ล็อกอิน → พาไปหน้า /login อัตโนมัติ
// =====================================================================
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useLogin } from './LoginProvider'
import { LoadingDots } from '@/shared/parts/LoadingDots'

export function MustLogin({ children }: { children: ReactNode }) {
  const { user, isChecking } = useLogin()
  const location = useLocation()

  if (isChecking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <LoadingDots />
      </div>
    )
  }
  if (!user) {
    // จำไว้ว่าจะไปหน้าไหน ล็อกอินเสร็จจะพากลับมา
    return <Navigate to="/login" replace state={{ goBackTo: location.pathname + location.search }} />
  }
  return <>{children}</>
}

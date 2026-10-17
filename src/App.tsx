// =====================================================================
// App.tsx : สร้างหน้าทั้งหมดของแอพ จากรายชื่อระบบใน allFeatures
//
//   หน้าที่ isPublic (เช่น ล็อกอิน) = เข้าได้เลย ไม่มีเมนู
//   หน้าอื่นๆ ทั้งหมด = ต้องล็อกอินก่อน และอยู่ในโครง PageLayout (มีเมนู)
// =====================================================================
import { useEffect, useRef } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { allFeatures } from '@/features/allFeatures'
import { deleteOldTrash } from '@/features/trash/deleteOldTrash'
import { MustLogin } from '@/shared/login/MustLogin'
import { useLogin } from '@/shared/login/LoginProvider'
import { PageLayout } from '@/shared/layout/PageLayout'

const publicFeatures = allFeatures.filter((feature) => feature.isPublic)
const loginFeatures = allFeatures.filter((feature) => !feature.isPublic)

const router = createBrowserRouter([
  // หน้าที่ไม่ต้องล็อกอิน
  ...publicFeatures.flatMap((feature) => feature.pages),
  // หน้าที่ต้องล็อกอิน (มีเมนู)
  {
    element: (
      <MustLogin>
        <PageLayout features={loginFeatures} />
      </MustLogin>
    ),
    children: loginFeatures.flatMap((feature) => feature.pages),
  },
  // ลิงก์ที่ไม่มีอยู่จริง: กลับหน้าแรก
  { path: '*', element: <Navigate to="/" replace /> },
])

export function App() {
  const { user } = useLogin()
  const hasCleanedTrash = useRef(false)

  // ล็อกอินแล้ว: ลบของในถังขยะที่เกิน 30 วัน (ทำครั้งเดียวต่อการเปิดแอพ)
  useEffect(() => {
    if (!user || hasCleanedTrash.current) return
    hasCleanedTrash.current = true
    deleteOldTrash(loginFeatures).then((deletedCount) => {
      if (deletedCount > 0) console.info(`ลบของเก่าในถังขยะ ${deletedCount} รายการ`)
    })
  }, [user])

  return <RouterProvider router={router} />
}

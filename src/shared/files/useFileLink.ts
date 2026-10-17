// =====================================================================
// useFileLink : แปลง path ไฟล์ → ลิงก์ที่เปิดได้ (ใช้ในหน้าจอ)
// ใช้งาน: const link = useFileLink(filePath)  → ได้ null ระหว่างรอ
// =====================================================================
import { useEffect, useState } from 'react'
import { getFileLink } from './fileStorage'

export function useFileLink(filePath: string | null | undefined) {
  const [link, setLink] = useState<string | null>(null)
  const [isBroken, setIsBroken] = useState(false)

  useEffect(() => {
    let isStillHere = true
    setLink(null)
    setIsBroken(false)
    if (!filePath) return
    getFileLink(filePath)
      .then((newLink) => isStillHere && setLink(newLink))
      .catch(() => isStillHere && setIsBroken(true))
    return () => {
      isStillHere = false
    }
  }, [filePath])

  return { link, isBroken }
}

// =====================================================================
// useUploadFile : อัปโหลดรูป/วิดีโอ พร้อมบอกสถานะ "กำลังอัปโหลด" ให้หน้าจอ
// ใช้งาน:
//   const { uploadOneFile, uploadingCount } = useUploadFile({ belongsToType: 'note', belongsToId: id })
//   const result = await uploadOneFile(file)   // ได้ null ถ้าไม่สำเร็จ
// =====================================================================
import { useCallback, useState } from 'react'
import { uploadPicture, uploadVideo, type FileOwner, type UploadedFile } from './fileStorage'
import { useShowMessage } from '@/shared/parts/PopupMessage'

export function useUploadFile(owner: FileOwner) {
  const [uploadingCount, setUploadingCount] = useState(0)
  const showMessage = useShowMessage()
  const { belongsToType, belongsToId } = owner

  /** อัปโหลด 1 ไฟล์ (รู้เองว่าเป็นรูปหรือวิดีโอ) */
  const uploadOneFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      setUploadingCount((count) => count + 1)
      try {
        const fileOwner = { belongsToType, belongsToId }
        if (file.type.startsWith('image/')) return await uploadPicture(file, fileOwner)
        if (file.type.startsWith('video/')) return await uploadVideo(file, fileOwner)
        throw new Error('ใส่ได้เฉพาะรูปภาพหรือวิดีโอ')
      } catch (error) {
        showMessage(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ', 'error')
        return null
      } finally {
        setUploadingCount((count) => count - 1)
      }
    },
    [belongsToType, belongsToId, showMessage],
  )

  return { uploadOneFile, uploadingCount, isUploading: uploadingCount > 0 }
}

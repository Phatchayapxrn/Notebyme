// =====================================================================
// AttachmentView : แสดงไฟล์แนบ 1 ไฟล์ในฟองข้อความ (รูป หรือ วิดีโอ)
// ไฟล์เก็บแบบส่วนตัว จึงต้องขอลิงก์ชั่วคราวก่อน (useFileLink)
// =====================================================================
import { ImageOff } from 'lucide-react'
import { useFileLink } from '@/shared/files/useFileLink'
import type { ChatAttachment } from '../types'

export function AttachmentView({ attachment }: { attachment: ChatAttachment }) {
  const { link, isBroken } = useFileLink(attachment.path)
  const isVideo = attachment.type.startsWith('video/')

  if (isBroken) {
    return (
      <div className="flex h-24 w-40 items-center justify-center gap-2 rounded-2xl bg-blush text-sm text-soft">
        <ImageOff size={18} aria-hidden="true" /> เปิดไฟล์ไม่ได้
      </div>
    )
  }
  if (!link) return <div className="h-24 w-40 animate-pulse rounded-2xl bg-blush" aria-label="กำลังโหลดไฟล์" />

  if (isVideo) return <video src={link} controls preload="metadata" className="max-h-72 max-w-full rounded-2xl" />
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <img src={link} alt="รูปที่แนบ" loading="lazy" className="max-h-72 max-w-full rounded-2xl object-cover" width={attachment.width} height={attachment.height} />
    </a>
  )
}

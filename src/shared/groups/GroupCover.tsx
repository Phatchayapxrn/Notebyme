// =====================================================================
// GroupCover : ภาพปกของหมวด (ลายสำเร็จรูป หรือรูปที่อัปโหลดเอง)
// =====================================================================
import { useFileLink } from '@/shared/files/useFileLink'
import { getPatternLink, isPatternCover } from './groupTypes'

interface GroupCoverProps {
  coverPicture: string
  /** สีพื้นหลัง (ใช้ตอนรูปยังโหลดไม่เสร็จ) */
  color: string
  className?: string
}

export function GroupCover({ coverPicture, color, className = '' }: GroupCoverProps) {
  const isPattern = isPatternCover(coverPicture)
  const { link } = useFileLink(isPattern ? null : coverPicture)
  const pictureLink = isPattern ? getPatternLink(coverPicture) : link

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage: pictureLink ? `url("${pictureLink}")` : undefined,
        backgroundSize: isPattern ? '64px' : 'cover',
        backgroundRepeat: isPattern ? 'repeat' : 'no-repeat',
      }}
      aria-hidden="true"
    />
  )
}

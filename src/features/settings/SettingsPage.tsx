// =====================================================================
// SettingsPage : หน้าตั้งค่า (/settings)
//   - บัญชี (อีเมล + ออกจากระบบ)
//   - จัดการหมวดหมู่
//   - พื้นที่เก็บไฟล์ที่ใช้ไป
//   - สำรองข้อมูล (ดาวน์โหลดเป็นไฟล์ .json)
//   - วิธีติดตั้งลงมือถือ
// =====================================================================
import { useEffect, useState } from 'react'
import { LogOut, Download } from 'lucide-react'
import { useLogin } from '@/shared/login/LoginProvider'
import { useAllFeatures } from '@/shared/layout/useAllFeatures'
import { getAllGroups } from '@/shared/groups/groupDatabase'
import { FREE_SPACE_LIMIT, getUsedSpace, toReadableSize } from '@/shared/files/fileStorage'
import { PageTitle } from '@/shared/parts/PageTitle'
import { WindowBox } from '@/shared/parts/WindowBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { toDateText } from '@/shared/dateTools'
import { logOut } from '../login/loginActions'
import { GroupManager } from './GroupManager'

export function SettingsPage() {
  const { user } = useLogin()
  const features = useAllFeatures()
  const showMessage = useShowMessage()
  const [usedSpace, setUsedSpace] = useState<number | null>(null)
  const [isMakingBackup, setIsMakingBackup] = useState(false)

  useEffect(() => {
    getUsedSpace()
      .then(setUsedSpace)
      .catch(() => setUsedSpace(null))
  }, [])

  /** รวมข้อมูลทุกระบบ แล้วดาวน์โหลดเป็นไฟล์ .json */
  async function downloadBackup() {
    setIsMakingBackup(true)
    try {
      const backup: Record<string, unknown> = {
        madeAt: new Date().toISOString(),
        email: user?.email,
        groups: await getAllGroups(),
      }
      for (const feature of features) {
        if (feature.getBackupData) backup[feature.id] = await feature.getBackupData()
      }
      const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(file)
      link.download = `idea-notes-backup-${toDateText(new Date())}.json`
      link.click()
      URL.revokeObjectURL(link.href)
      showMessage('ดาวน์โหลดไฟล์สำรองแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'สำรองข้อมูลไม่สำเร็จ', 'error')
    } finally {
      setIsMakingBackup(false)
    }
  }

  const usedPercent = usedSpace === null ? 0 : Math.min(100, (usedSpace / FREE_SPACE_LIMIT) * 100)

  return (
    <>
      <PageTitle smallLabel="SETTINGS" title="ตั้งค่า." underText="ปรับแต่งให้เป็นของเรา" />

      <div className="flex flex-col gap-6">
        <WindowBox title="account.exe">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="small-label mb-1">เข้าสู่ระบบด้วย</p>
              <p className="font-cute text-lg">{user?.email}</p>
            </div>
            <RoundButton look="plain" icon={<LogOut size={17} />} onClick={logOut}>
              ออกจากระบบ
            </RoundButton>
          </div>
        </WindowBox>

        <WindowBox title="groups.exe">
          <p className="small-label mb-3">หมวดหมู่</p>
          <GroupManager />
        </WindowBox>

        <WindowBox title="storage.exe">
          <p className="small-label mb-3">พื้นที่เก็บรูป / วิดีโอ</p>
          <div className="h-3 overflow-hidden rounded-full bg-blush" role="progressbar" aria-valuenow={Math.round(usedPercent)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-rose transition-all" style={{ width: `${Math.max(usedPercent, 1)}%` }} />
          </div>
          <p className="mt-2 font-typewriter text-sm text-soft">
            {usedSpace === null ? 'กำลังคำนวณ...' : `ใช้ไป ${toReadableSize(usedSpace)} จาก ${toReadableSize(FREE_SPACE_LIMIT)} (แบบฟรี)`}
          </p>
        </WindowBox>

        <WindowBox title="backup.exe">
          <p className="small-label mb-2">สำรองข้อมูล</p>
          <p className="mb-4 text-sm text-soft">ดาวน์โหลดไอเดีย งาน และหมวดหมู่ทั้งหมด เป็นไฟล์ .json เก็บไว้ (ไม่รวมไฟล์รูป/วิดีโอ)</p>
          <RoundButton look="pink" icon={<Download size={17} />} onClick={downloadBackup} disabled={isMakingBackup}>
            {isMakingBackup ? 'กำลังเตรียมไฟล์...' : 'ดาวน์โหลดไฟล์สำรอง'}
          </RoundButton>
        </WindowBox>

        <WindowBox title="install.exe">
          <p className="small-label mb-2">ติดตั้งลงมือถือ</p>
          <ul className="flex flex-col gap-1.5 text-[15px]">
            <li>
              📱 <b>iPhone:</b> เปิดเว็บนี้ใน Safari &gt; กดปุ่มแชร์ &gt; <b>เพิ่มไปยังหน้าจอโฮม</b>
            </li>
            <li>
              🤖 <b>Android:</b> เปิดใน Chrome &gt; เมนู ⋮ &gt; <b>ติดตั้งแอป</b>
            </li>
          </ul>
        </WindowBox>
      </div>
    </>
  )
}

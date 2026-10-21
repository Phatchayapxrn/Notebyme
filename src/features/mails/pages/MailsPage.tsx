// =====================================================================
// MailsPage : หน้าเก็บเมล (/mails)
// ใส่เมลกับรหัสไว้เป็นชุดๆ แล้วโชว์เป็นการ์ดให้เลือก กดเปิดการ์ด → คัดลอกทีละช่องได้
// =====================================================================
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PageTitle } from '@/shared/parts/PageTitle'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { MAILS_TABLE, addMailSet, getAllMailSets } from '../database'
import { MailSetCard } from '../parts/MailSetCard'

export function MailsPage() {
  const showMessage = useShowMessage()
  const { items: sets, isLoading, errorText } = useLiveList({ tableName: MAILS_TABLE, getList: getAllMailSets })
  const [newSetId, setNewSetId] = useState<string | null>(null)

  async function addSet() {
    try {
      const nextOrder = sets.reduce((biggest, set) => Math.max(biggest, set.orderNumber), 0) + 1
      setNewSetId(await addMailSet(nextOrder))
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'เพิ่มไม่สำเร็จ', 'error')
    }
  }

  return (
    <>
      <PageTitle smallLabel="MAILS" title="เก็บเมล." underText="เมลกับรหัสแยกเป็นชุด กดคัดลอกไปใช้ต่อได้เลย" />

      {isLoading && <LoadingDots />}
      {errorText && <p className="mb-3 text-sm text-danger">{errorText}</p>}

      <div className="flex flex-col gap-3">
        {!isLoading && sets.length === 0 && (
          <EmptyMessage emoji="✉️" title="ยังไม่มีชุดเมล" text="กด “เพิ่มชุดใหม่” แล้วใส่เมลกับรหัสไว้ ครั้งหน้ากดคัดลอกได้ทันที" />
        )}
        {sets.map((set, index) => (
          <MailSetCard key={set.id} set={set} setNumber={index + 1} startEditing={set.id === newSetId} />
        ))}
        <RoundButton look="main" icon={<Plus size={17} />} onClick={addSet} className="self-start">
          เพิ่มชุดใหม่
        </RoundButton>
      </div>
    </>
  )
}

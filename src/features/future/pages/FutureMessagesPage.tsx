// =====================================================================
// FutureMessagesPage : หน้า "ถึงตัวเองในอนาคต" (/future)
//   - กล่องเขียนข้อความ + เลือกวันที่จะเปิดอ่าน
//   - ถึงวันเปิดแล้ว (ใหม่ล่าสุดอยู่บน)
//   - รอวันเปิด (ใกล้ถึงวันอยู่บน) ข้อความถูกซ่อนไว้ แอบดู/แก้ได้
// ข้อความที่ถึงวันแล้วและยังไม่อ่าน จะขึ้นโชว์ในหน้าแรกด้วย (FutureHomeCard)
// =====================================================================
import { useLiveList } from '@/shared/data/useLiveList'
import { PageTitle } from '@/shared/parts/PageTitle'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { getAllFutureMessages, isOpenNow } from '../database'
import { WriteFutureMessageBox } from '../parts/WriteFutureMessageBox'
import { FutureMessageCard } from '../parts/FutureMessageCard'

export function FutureMessagesPage() {
  const { items: messages, isLoading } = useLiveList({ tableName: 'future_messages', getList: getAllFutureMessages })

  const openedMessages = messages.filter(isOpenNow).reverse() // ใหม่ล่าสุดก่อน
  const waitingMessages = messages.filter((message) => !isOpenNow(message)) // ใกล้ถึงวันก่อน

  return (
    <>
      <PageTitle smallLabel="DEAR FUTURE ME" title="ถึงตัวเองในอนาคต." underText="เขียนไว้วันนี้ แล้วรอวันเปิดอ่าน" />

      <WriteFutureMessageBox />

      {isLoading ? (
        <LoadingDots />
      ) : messages.length === 0 ? (
        <div className="mt-8">
          <EmptyMessage emoji="💌" title="ยังไม่มีข้อความ" text="ลองเขียนอะไรถึงตัวเองดู แล้วเลือกวันที่อยากให้เปิดอ่าน" />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {openedMessages.length > 0 && (
            <section>
              <h2 className="small-label mb-3">ถึงวันเปิดแล้ว ({openedMessages.length})</h2>
              <div className="flex flex-col gap-3">
                {openedMessages.map((message) => (
                  <FutureMessageCard key={message.id} message={message} />
                ))}
              </div>
            </section>
          )}
          {waitingMessages.length > 0 && (
            <section>
              <h2 className="small-label mb-3">รอวันเปิด ({waitingMessages.length})</h2>
              <div className="flex flex-col gap-3">
                {waitingMessages.map((message) => (
                  <FutureMessageCard key={message.id} message={message} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
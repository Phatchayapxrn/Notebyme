// =====================================================================
// FutureHomeCard : ส่วนของ "ถึงตัวเองในอนาคต" ที่ไปโชว์ในหน้าแรก
//   - มีข้อความที่ถึงวันแล้วแต่ยังไม่อ่าน → โชว์ข้อความเต็ม + ปุ่ม "อ่านแล้ว"
//   - ไม่มี แต่มีข้อความรออยู่ → บอกว่าฉบับถัดไปเปิดอีกกี่วัน
//   - ไม่มีข้อความเลย → ไม่โชว์อะไร
// =====================================================================
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useLiveList } from '@/shared/data/useLiveList'
import { RoundButton } from '@/shared/parts/RoundButton'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { daysUntil, showShortDate } from '@/shared/dateTools'
import { getAllFutureMessages, isOpenNow, markFutureMessageRead } from '../database'

export function FutureHomeCard() {
  const showMessage = useShowMessage()
  const { items: messages } = useLiveList({ tableName: 'future_messages', getList: getAllFutureMessages })

  const newMessages = messages.filter((message) => isOpenNow(message) && !message.isRead)
  const waitingMessages = messages.filter((message) => !isOpenNow(message))
  if (newMessages.length === 0 && waitingMessages.length === 0) return null

  async function markRead(messageId: string) {
    try {
      await markFutureMessageRead(messageId)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ทำไม่สำเร็จ', 'error')
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="small-label">ถึงตัวเองในอนาคต</h2>
        <Link to="/future" className="flex items-center gap-1 text-sm text-wine hover:underline">
          ดูทั้งหมด <ArrowRight size={14} />
        </Link>
      </div>

      {newMessages.length > 0 ? (
        <div className="flex flex-col gap-3">
          {newMessages.map((message) => (
            <article key={message.id} className="rounded-3xl border border-rose/60 bg-paper p-5 shadow-soft">
              <p className="mb-2 font-typewriter text-xs text-rose">💌 ข้อความจากตัวคุณเมื่อ {showShortDate(message.createdAt)}</p>
              <p className="whitespace-pre-wrap font-cute text-[17px] leading-relaxed text-ink">{message.text}</p>
              <div className="mt-4 flex justify-end">
                <RoundButton look="pink" size="small" icon={<Check size={15} />} onClick={() => markRead(message.id)}>
                  อ่านแล้ว
                </RoundButton>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Link to="/future" className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 transition hover:bg-blush">
          <span className="text-2xl" aria-hidden="true">💌</span>
          <span className="text-[15px] text-ink">
            มีข้อความรอเปิดอีก {waitingMessages.length} ฉบับ
            <span className="block font-typewriter text-xs text-soft">ฉบับถัดไปเปิดในอีก {daysUntil(waitingMessages[0].showDate)} วัน</span>
          </span>
        </Link>
      )}
    </section>
  )
}
// =====================================================================
// PopupMessage : ข้อความเด้งเล็กๆ ด้านล่างจอ แล้วหายไปเอง (เช่น "บันทึกแล้ว")
//
// ใช้งาน:
//   const showMessage = useShowMessage()
//   showMessage('บันทึกแล้ว')               // แบบปกติ
//   showMessage('อัปโหลดไม่สำเร็จ', 'error')  // แบบเตือน
// ต้องมี <PopupMessageProvider> ครอบแอพไว้ (อยู่ใน main.tsx แล้ว)
// =====================================================================
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CircleAlert, Check } from 'lucide-react'

type MessageKind = 'normal' | 'error'

interface OneMessage {
  id: number
  text: string
  kind: MessageKind
}

type ShowMessage = (text: string, kind?: MessageKind) => void

const MessageContext = createContext<ShowMessage>(() => {})

export function PopupMessageProvider({ children }: { children: ReactNode }) {
  const [messageList, setMessageList] = useState<OneMessage[]>([])

  const showMessage = useCallback<ShowMessage>((text, kind = 'normal') => {
    const id = Date.now() + Math.random()
    setMessageList((oldList) => [...oldList.slice(-2), { id, text, kind }])
    // หายไปเองหลัง 2.5 วินาที (แบบเตือน 4 วินาที)
    window.setTimeout(
      () => setMessageList((oldList) => oldList.filter((message) => message.id !== id)),
      kind === 'error' ? 4000 : 2500,
    )
  }, [])

  return (
    <MessageContext.Provider value={showMessage}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {messageList.map((message) => (
          <div
            key={message.id}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm shadow-soft ${
              message.kind === 'error' ? 'bg-danger text-paper' : 'bg-wine text-paper'
            }`}
          >
            {message.kind === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}
            {message.text}
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  )
}

/** ได้ฟังก์ชัน showMessage ไว้เด้งข้อความ */
export function useShowMessage() {
  return useContext(MessageContext)
}

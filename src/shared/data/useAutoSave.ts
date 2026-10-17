// =====================================================================
// useAutoSave : บันทึกอัตโนมัติเมื่อหยุดพิมพ์ + มี saveNow() ไว้ให้ปุ่ม "บันทึก"
//
// ใช้งาน:
//   const { saveStatus, saveNow } = useAutoSave({
//     value: { title, content },          // ข้อมูลที่ต้องการบันทึก
//     saveValue: (v) => saveNote(id, v),  // ฟังก์ชันบันทึกจริง
//     isReady: !isLoading,                // รอโหลดข้อมูลเสร็จก่อนค่อยเริ่ม
//     draftName: `note-${id}`,            // ชื่อร่างที่เก็บในเครื่อง (ตอนเน็ตหลุด)
//   })
//
// บันทึกเองเมื่อ: หยุดพิมพ์ครบ waitTime / ออกจากหน้า / สลับแอพ / ปิดแท็บ / เน็ตกลับมา
// =====================================================================
import { useCallback, useEffect, useRef, useState } from 'react'

/** สถานะการบันทึก */
export type SaveStatus =
  | 'saved' //     บันทึกแล้ว
  | 'not-saved' // มีการแก้ไขที่ยังไม่บันทึก
  | 'saving' //    กำลังบันทึก
  | 'failed' //    บันทึกไม่สำเร็จ
  | 'offline' //   ไม่มีเน็ต (เก็บร่างไว้ในเครื่องก่อน)

interface AutoSaveSettings<Value> {
  value: Value
  saveValue: (value: Value) => Promise<void>
  isReady: boolean
  draftName?: string
  /** รอหลังหยุดพิมพ์กี่มิลลิวินาทีถึงจะบันทึก (ค่าเริ่มต้น 800 = 0.8 วินาที) */
  waitTime?: number
}

/** ร่างที่เก็บไว้ในเครื่อง */
interface SavedDraft<Value> {
  value: Value
  savedTime: number
}

export function useAutoSave<Value>({ value, saveValue, isReady, draftName, waitTime = 800 }: AutoSaveSettings<Value>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')

  const latestValue = useRef(value)
  latestValue.current = value
  const saveValueRef = useRef(saveValue)
  saveValueRef.current = saveValue

  const lastSavedText = useRef<string | null>(null)
  const isSavingNow = useRef(false)
  const needSaveAgain = useRef(false)
  const waitTimer = useRef<number>()

  /** บันทึกทันที (ใช้กับปุ่ม "บันทึก") คืนค่า true ถ้าสำเร็จ */
  const saveNow = useCallback(async (): Promise<boolean> => {
    window.clearTimeout(waitTimer.current)
    if (lastSavedText.current === null) return true // ยังโหลดข้อมูลไม่เสร็จ

    if (isSavingNow.current) {
      needSaveAgain.current = true
      return true
    }

    const valueToSave = latestValue.current
    const textToSave = JSON.stringify(valueToSave)
    if (textToSave === lastSavedText.current) {
      setSaveStatus('saved')
      return true
    }

    isSavingNow.current = true
    setSaveStatus('saving')
    let isSuccess = false
    try {
      await saveValueRef.current(valueToSave)
      lastSavedText.current = textToSave
      if (draftName) deleteDraft(draftName)
      isSuccess = true
      // ระหว่างบันทึก ผู้ใช้อาจพิมพ์ต่อ
      setSaveStatus(JSON.stringify(latestValue.current) === textToSave ? 'saved' : 'not-saved')
    } catch {
      if (draftName) keepDraft(draftName, valueToSave)
      setSaveStatus(navigator.onLine ? 'failed' : 'offline')
    } finally {
      isSavingNow.current = false
    }

    if (needSaveAgain.current) {
      needSaveAgain.current = false
      return saveNow()
    }
    return isSuccess
  }, [draftName])

  // เริ่มต้น: ถือว่าข้อมูลที่โหลดมาคือข้อมูลที่บันทึกแล้ว
  useEffect(() => {
    if (isReady && lastSavedText.current === null) {
      lastSavedText.current = JSON.stringify(latestValue.current)
    }
  }, [isReady])

  // ทุกครั้งที่ข้อมูลเปลี่ยน → รอให้หยุดพิมพ์แล้วค่อยบันทึก
  const valueText = JSON.stringify(value)
  useEffect(() => {
    if (lastSavedText.current === null || valueText === lastSavedText.current) return
    setSaveStatus('not-saved')
    window.clearTimeout(waitTimer.current)
    waitTimer.current = window.setTimeout(saveNow, waitTime)
  }, [valueText, saveNow, waitTime])

  // บันทึกเมื่อ: สลับแอพ / ปิดแท็บ / เน็ตกลับมา / ออกจากหน้า
  useEffect(() => {
    const whenPageHidden = () => {
      if (document.visibilityState === 'hidden') saveNow()
    }
    const whenOnlineAgain = () => saveNow()
    const whenClosingTab = () => {
      saveNow()
    }
    document.addEventListener('visibilitychange', whenPageHidden)
    window.addEventListener('online', whenOnlineAgain)
    window.addEventListener('beforeunload', whenClosingTab)
    return () => {
      document.removeEventListener('visibilitychange', whenPageHidden)
      window.removeEventListener('online', whenOnlineAgain)
      window.removeEventListener('beforeunload', whenClosingTab)
      saveNow() // ออกจากหน้านี้ → บันทึกสิ่งที่ค้างอยู่
    }
  }, [saveNow])

  return { saveStatus, saveNow }
}

// ---------------------------------------------------------------------
// ร่างในเครื่อง (localStorage) : กันข้อมูลหายตอนเน็ตหลุด
// ---------------------------------------------------------------------

function draftKey(draftName: string) {
  return `draft:${draftName}`
}

/** เก็บร่างไว้ในเครื่อง */
export function keepDraft<Value>(draftName: string, value: Value) {
  try {
    const draft: SavedDraft<Value> = { value, savedTime: Date.now() }
    localStorage.setItem(draftKey(draftName), JSON.stringify(draft))
  } catch {
    // เครื่องไม่ให้เก็บ (เช่นโหมดไม่ระบุตัวตน) → ข้ามไป
  }
}

/** อ่านร่างที่เก็บไว้ (ไม่มี = null) */
export function getDraft<Value>(draftName: string): SavedDraft<Value> | null {
  try {
    const text = localStorage.getItem(draftKey(draftName))
    return text ? (JSON.parse(text) as SavedDraft<Value>) : null
  } catch {
    return null
  }
}

/** ลบร่างทิ้ง (เมื่อบันทึกขึ้นฐานข้อมูลสำเร็จแล้ว) */
export function deleteDraft(draftName: string) {
  try {
    localStorage.removeItem(draftKey(draftName))
  } catch {
    // ข้าม
  }
}

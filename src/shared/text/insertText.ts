// =====================================================================
// insertText.ts : ใส่ข้อความ (เช่น อีโมจิ) ตรงตำแหน่งที่กำลังพิมพ์อยู่ในช่องพิมพ์
//
// ใช้งาน:
//   const box = useRef<HTMLTextAreaElement>(null)
//   insertAtCursor(box.current, text, '😊', setText)
// =====================================================================

/** ใส่ข้อความตรงตำแหน่งเคอร์เซอร์ (ถ้าเลือกข้อความไว้ จะแทนที่ส่วนที่เลือก) */
export function insertAtCursor(
  box: HTMLTextAreaElement | HTMLInputElement | null,
  currentText: string,
  textToAdd: string,
  setText: (newText: string) => void,
) {
  const start = box?.selectionStart ?? currentText.length
  const end = box?.selectionEnd ?? currentText.length
  const newText = currentText.slice(0, start) + textToAdd + currentText.slice(end)
  setText(newText)
  // รอหน้าจอวาดใหม่ก่อน แล้วค่อยย้ายเคอร์เซอร์ไปท้ายตัวที่เพิ่งใส่
  const newCursor = start + textToAdd.length
  requestAnimationFrame(() => {
    if (!box) return
    box.focus()
    box.setSelectionRange(newCursor, newCursor)
  })
}
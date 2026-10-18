// =====================================================================
// copyText.ts : คัดลอกข้อความลงคลิปบอร์ด + จัดบรรทัดให้เรียบร้อยก่อนคัดลอก
//
// ปัญหาที่แก้: ข้อความที่วางมาจากที่อื่น (เว็บ / แชท / Word) มักมีบรรทัดว่างซ้อนกันหลายบรรทัด
// พอคัดลอกไปวางต่อ ช่องว่างระหว่างย่อหน้าจะห่างเกินไป
//   → cleanText() ยุบบรรทัดว่างที่ติดกันหลายบรรทัด ให้เหลือบรรทัดว่างแค่ 1 บรรทัด
// =====================================================================

/**
 * จัดข้อความให้เรียบร้อย:
 *   - เปลี่ยนตัวขึ้นบรรทัดแบบ Windows (\r\n) เป็นแบบเดียวกันหมด (\n)
 *   - ลบช่องว่างที่ค้างอยู่ท้ายบรรทัด
 *   - บรรทัดว่างติดกันหลายบรรทัด → เหลือ 1 บรรทัด
 *   - ตัดบรรทัดว่างหัว-ท้ายข้อความออก
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ') // ช่องว่างพิเศษจากเว็บ → ช่องว่างธรรมดา
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '')
}

/** คัดลอกข้อความลงคลิปบอร์ด (จัดบรรทัดให้ก่อน) คืนค่า true ถ้าสำเร็จ */
export async function copyText(text: string): Promise<boolean> {
  const textToCopy = cleanText(text)
  try {
    await navigator.clipboard.writeText(textToCopy)
    return true
  } catch {
    // เบราว์เซอร์เก่า / ไม่ได้เปิดผ่าน https → ใช้วิธีเก่า
    return copyTheOldWay(textToCopy)
  }
}

/** วิธีคัดลอกแบบเก่า: สร้างช่องข้อความซ่อนไว้ เลือกข้อความ แล้วสั่งคัดลอก */
function copyTheOldWay(text: string): boolean {
  const hiddenBox = document.createElement('textarea')
  hiddenBox.value = text
  hiddenBox.setAttribute('readonly', '')
  hiddenBox.style.position = 'fixed'
  hiddenBox.style.opacity = '0'
  document.body.appendChild(hiddenBox)
  hiddenBox.select()
  let isSuccess = false
  try {
    isSuccess = document.execCommand('copy')
  } catch {
    isSuccess = false
  }
  hiddenBox.remove()
  return isSuccess
}

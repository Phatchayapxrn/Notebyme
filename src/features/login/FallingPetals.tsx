// =====================================================================
// FallingPetals : กลีบดอกไม้ร่วงเป็นพื้นหลัง (ตกแต่งเฉยๆ)
// ถ้าเครื่องตั้งค่า "ลดการเคลื่อนไหว" ไว้ จะไม่แสดง (ดู .petal ใน index.css)
// =====================================================================

/** ตำแหน่ง / ความเร็ว / ขนาด ของแต่ละกลีบ (กำหนดไว้ตายตัว จะได้ไม่สุ่มใหม่ทุกครั้ง) */
const PETALS = [
  { left: 5, delay: 0, duration: 11, size: 1 },
  { left: 15, delay: 4, duration: 14, size: 0.7 },
  { left: 27, delay: 2, duration: 12, size: 1.2 },
  { left: 38, delay: 7, duration: 15, size: 0.8 },
  { left: 50, delay: 1, duration: 13, size: 1 },
  { left: 61, delay: 5, duration: 11, size: 1.3 },
  { left: 72, delay: 3, duration: 16, size: 0.7 },
  { left: 83, delay: 6, duration: 12, size: 1.1 },
  { left: 92, delay: 2.5, duration: 14, size: 0.9 },
]

export function FallingPetals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            transform: `scale(${petal.size})`,
            width: 14 * petal.size,
            height: 10 * petal.size,
          }}
        />
      ))}
    </div>
  )
}

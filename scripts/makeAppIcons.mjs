// =====================================================================
// makeAppIcons.mjs : สร้างไอคอนแอพ (รูปหัวใจบนพื้นชมพู) เป็นไฟล์ PNG
// รัน: npm run make-icons   → ได้ไฟล์ใน public/icons/
// อยากใช้ไอคอนของตัวเอง: เอาไฟล์ PNG ไปวางทับใน public/icons/ ได้เลย (ชื่อเดิม ขนาดเดิม)
// =====================================================================
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BACKGROUND = [251, 228, 232] // ชมพูอ่อน #FBE4E8
const HEART = [217, 138, 154] //      ชมพูเข้ม #D98A9A
const SHINE = [255, 248, 244] //      ครีม (จุดวาวบนหัวใจ)

/** true = จุด (x, y) อยู่ในรูปหัวใจ (สูตรหัวใจทางคณิตศาสตร์) */
function isInsideHeart(x, y) {
  const value = (x * x + y * y - 1) ** 3 - x * x * y ** 3
  return value <= 0
}

/** วาดไอคอนขนาด size x size คืนค่าเป็นข้อมูลสี RGB ทีละจุด */
function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 3)
  const samples = 4 // วาดละเอียด 4x4 ต่อจุด เพื่อให้ขอบเนียน
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      let heartAmount = 0
      let shineAmount = 0
      for (let sampleY = 0; sampleY < samples; sampleY++) {
        for (let sampleX = 0; sampleX < samples; sampleX++) {
          // แปลงตำแหน่งจุด เป็นพิกัดของหัวใจ (หัวใจกว้างประมาณ 55% ของไอคอน)
          const x = (((column + (sampleX + 0.5) / samples) / size) - 0.5) * 4.2
          const y = -((((row + (sampleY + 0.5) / samples) / size) - 0.52) * 4.2)
          if (isInsideHeart(x, y)) heartAmount += 1
          const shineX = x + 0.55
          const shineY = y - 0.55
          if (shineX * shineX + shineY * shineY < 0.03) shineAmount += 1
        }
      }
      const total = samples * samples
      const heartPart = heartAmount / total
      const shinePart = shineAmount / total
      const index = (row * size + column) * 3
      for (let channel = 0; channel < 3; channel++) {
        let color = BACKGROUND[channel] * (1 - heartPart) + HEART[channel] * heartPart
        color = color * (1 - shinePart) + SHINE[channel] * shinePart
        pixels[index + channel] = Math.round(color)
      }
    }
  }
  return pixels
}

/** แปลงข้อมูลสี เป็นไฟล์ PNG */
function makePng(size, pixels) {
  const rows = Buffer.alloc(size * (size * 3 + 1))
  for (let row = 0; row < size; row++) {
    rows[row * (size * 3 + 1)] = 0
    pixels.copy(rows, row * (size * 3 + 1) + 1, row * size * 3, (row + 1) * size * 3)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // 8 bit
  header[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', header),
    makeChunk('IDAT', deflateSync(rows, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type), data])
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([length, typeAndData, checksum])
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}

mkdirSync('public/icons', { recursive: true })
for (const [fileName, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(`public/icons/${fileName}`, makePng(size, drawIcon(size)))
  console.log(`สร้าง public/icons/${fileName} แล้ว`)
}

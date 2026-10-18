// =====================================================================
// fancyLetters.ts : เปลี่ยนตัวอักษรเป็น "ฟอนต์พิเศษ" ที่คัดลอกไปวางที่อื่นได้
//   เช่น Hello → ตัวหนา / ลายมือ / ในวงกลม / ตัวกว้าง
//
// ทำงานยังไง: ไม่ได้เปลี่ยนฟอนต์จริง แต่เปลี่ยนเป็น "ตัวอักษรพิเศษ" ในระบบ Unicode
// จึงคัดลอกไปวางใน Facebook / IG / LINE แล้วยังเป็นแบบเดิม
//
// ข้อจำกัด: ตัวอักษรพิเศษมีแค่ภาษาอังกฤษ (A-Z, a-z) และตัวเลข
//   ภาษาไทยจะเหมือนเดิม ยกเว้นแบบ "ขีดฆ่า" และ "ขีดเส้นใต้" ที่ใช้ได้กับทุกภาษา
// (ในไฟล์นี้เขียนตัวอักษรพิเศษเป็นรหัส \u.... เพราะบางโปรแกรมแสดงตัวพวกนี้ไม่ได้)
// =====================================================================

/** ข้อมูลของฟอนต์ 1 แบบ */
export interface FancyStyle {
  id: string
  /** ชื่อภาษาไทย */
  name: string
  /** true = ใช้กับภาษาไทยได้ด้วย */
  worksWithThai?: boolean
}

/** ฟอนต์ทั้งหมดที่เลือกได้ (เรียงตามที่แสดงในเมนู) — ตัวอย่างหน้าตาใช้ showFancyExample() */
export const FANCY_STYLES: FancyStyle[] = [
  { id: 'normal', name: 'ตัวปกติ (ล้างฟอนต์)', worksWithThai: true },
  { id: 'bold', name: 'ตัวหนา' },
  { id: 'italic', name: 'ตัวเอียง' },
  { id: 'boldItalic', name: 'หนา + เอียง' },
  { id: 'sansBold', name: 'หนาแบบเรียบ' },
  { id: 'sansItalic', name: 'เอียงแบบเรียบ' },
  { id: 'script', name: 'ลายมือ' },
  { id: 'gothic', name: 'โกธิค' },
  { id: 'outline', name: 'ตัวกลวง' },
  { id: 'typewriter', name: 'พิมพ์ดีด' },
  { id: 'circle', name: 'ในวงกลม' },
  { id: 'wide', name: 'ตัวกว้าง' },
  { id: 'smallCaps', name: 'ตัวใหญ่จิ๋ว' },
  { id: 'strike', name: 'ขีดฆ่า', worksWithThai: true },
  { id: 'underline', name: 'ขีดเส้นใต้', worksWithThai: true },
]

/** ตัวอย่างหน้าตาของฟอนต์ (โชว์ในเมนู) */
export function showFancyExample(styleId: string): string {
  const style = FANCY_STYLES.find((oneStyle) => oneStyle.id === styleId)
  return toFancyLetters(style?.worksWithThai ? 'Abc กขค' : 'Abc 123', styleId)
}

/** จุดเริ่มต้นของแต่ละฟอนต์ใน Unicode: [A, a, 0] (null = ฟอนต์นี้ไม่มีตัวเลข) */
const STARTING_POINTS: Record<string, [number, number, number | null]> = {
  bold: [0x1d400, 0x1d41a, 0x1d7ce],
  italic: [0x1d434, 0x1d44e, null],
  boldItalic: [0x1d468, 0x1d482, null],
  sansBold: [0x1d5d4, 0x1d5ee, 0x1d7ec],
  sansItalic: [0x1d608, 0x1d622, null],
  script: [0x1d4d0, 0x1d4ea, null],
  gothic: [0x1d56c, 0x1d586, null],
  outline: [0x1d538, 0x1d552, 0x1d7d8],
  typewriter: [0x1d670, 0x1d68a, 0x1d7f6],
  wide: [0xff21, 0xff41, 0xff10],
}

/** ตัวอักษรบางตัวที่ Unicode ใส่ไว้คนละที่ (ต้องใช้ตัวนี้แทน) */
const SPECIAL_LETTERS: Record<string, Record<string, string>> = {
  italic: { h: '\u210e' },
  outline: { C: '\u2102', H: '\u210d', N: '\u2115', P: '\u2119', Q: '\u211a', R: '\u211d', Z: '\u2124' },
}

/** ตัวใหญ่จิ๋ว a-z (x ไม่มีแบบจิ๋ว ใช้ตัวเดิม) */
const SMALL_CAPS = [
  '\u1d00', '\u0299', '\u1d04', '\u1d05', '\u1d07', '\ua730', '\u0262', '\u029c', '\u026a', '\u1d0a', '\u1d0b', '\u029f', '\u1d0d',
  '\u0274', '\u1d0f', '\u1d18', '\u01eb', '\u0280', '\ua731', '\u1d1b', '\u1d1c', '\u1d20', '\u1d21', 'x', '\u028f', '\u1d22',
]

/** ขีดที่ซ้อนบนตัวอักษร */
const LINE_MARKS: Record<string, string> = { strike: '\u0336', underline: '\u0332' }

const SMALL_ABC = 'abcdefghijklmnopqrstuvwxyz'

/** เปลี่ยนตัวอักษร 1 ตัว เป็นฟอนต์ที่เลือก */
function changeOneLetter(letter: string, styleId: string): string {
  const special = SPECIAL_LETTERS[styleId]?.[letter]
  if (special) return special

  if (styleId === 'smallCaps') {
    const index = SMALL_ABC.indexOf(letter.toLowerCase())
    return index >= 0 ? SMALL_CAPS[index] : letter
  }
  if (styleId === 'circle') {
    if (letter >= 'A' && letter <= 'Z') return String.fromCodePoint(0x24b6 + letter.charCodeAt(0) - 65)
    if (letter >= 'a' && letter <= 'z') return String.fromCodePoint(0x24d0 + letter.charCodeAt(0) - 97)
    if (letter === '0') return '\u24ea'
    if (letter >= '1' && letter <= '9') return String.fromCodePoint(0x2460 + letter.charCodeAt(0) - 49)
    return letter
  }

  const points = STARTING_POINTS[styleId]
  if (!points) return letter
  const [bigA, smallA, zero] = points
  if (letter >= 'A' && letter <= 'Z') return String.fromCodePoint(bigA + letter.charCodeAt(0) - 65)
  if (letter >= 'a' && letter <= 'z') return String.fromCodePoint(smallA + letter.charCodeAt(0) - 97)
  if (zero !== null && letter >= '0' && letter <= '9') return String.fromCodePoint(zero + letter.charCodeAt(0) - 48)
  return letter
}

/** แบ่งข้อความเป็นทีละ "ตัวที่เห็นบนจอ" (สระ/วรรณยุกต์ไทยติดไปกับพยัญชนะ) */
function splitIntoShownLetters(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const splitter = new Intl.Segmenter('th', { granularity: 'grapheme' })
    return Array.from(splitter.segment(text), (piece) => piece.segment)
  }
  return Array.from(text)
}

/** ตัวอักษรนี้เป็นตัวอักษรพิเศษไหม (ใช้ตอนล้างฟอนต์กลับเป็นตัวปกติ) */
function isFancyLetter(letter: string): boolean {
  const code = letter.codePointAt(0) ?? 0
  return (
    (code >= 0x1d400 && code <= 0x1d7ff) || // ตัวหนา / เอียง / ลายมือ / ...
    (code >= 0x2100 && code <= 0x214f) || //   ตัวพิเศษอย่าง h เอียง, C กลวง
    (code >= 0x2460 && code <= 0x24ff) || //   ในวงกลม
    (code >= 0xff01 && code <= 0xff5e) //      ตัวกว้าง
  )
}

/** ล้างฟอนต์พิเศษ กลับเป็นตัวอักษรปกติ */
export function toNormalLetters(text: string): string {
  const withoutLines = text.replace(/[\u0336\u0332]/g, '')
  return Array.from(withoutLines)
    .map((letter) => {
      const smallCapIndex = SMALL_CAPS.indexOf(letter)
      if (smallCapIndex >= 0) return SMALL_ABC[smallCapIndex]
      // normalize('NFKC') เปลี่ยนตัวพิเศษกลับเป็นตัวปกติ (ทำทีละตัว เพื่อไม่ให้กระทบภาษาไทย)
      return isFancyLetter(letter) ? letter.normalize('NFKC') : letter
    })
    .join('')
}

/** เปลี่ยนข้อความทั้งก้อนเป็นฟอนต์ที่เลือก (ล้างฟอนต์เดิมก่อน จะได้ไม่ซ้อนกัน) */
export function toFancyLetters(text: string, styleId: string): string {
  const normalText = toNormalLetters(text)
  if (styleId === 'normal') return normalText

  const lineMark = LINE_MARKS[styleId]
  if (lineMark) {
    return splitIntoShownLetters(normalText)
      .map((letter) => (/\s/.test(letter) ? letter : letter + lineMark))
      .join('')
  }
  return Array.from(normalText)
    .map((letter) => changeOneLetter(letter, styleId))
    .join('')
}

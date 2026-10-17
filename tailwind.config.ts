// ตั้งค่า Tailwind: สี ฟอนต์ และเงา ของทั้งเว็บอยู่ที่นี่
// อยากเปลี่ยนสีทั้งเว็บ → ไปแก้ค่าสีใน src/index.css (ส่วน :root)
import type { Config } from 'tailwindcss'

// ช่วยให้สีจาก CSS variable ใช้กับความโปร่งใสได้ เช่น bg-wine/50
function colorFromVariable(variableName: string) {
  return `rgb(var(${variableName}) / <alpha-value>)`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: colorFromVariable('--color-cream'), //   พื้นหลังครีม
        paper: colorFromVariable('--color-paper'), //   พื้นกล่อง (ขาว)
        blush: colorFromVariable('--color-blush'), //   ชมพูอ่อน
        pink: colorFromVariable('--color-pink'), //     ชมพูกลาง
        rose: colorFromVariable('--color-rose'), //     ชมพูเข้ม (ตัวหนังสือน่ารักๆ)
        wine: colorFromVariable('--color-wine'), //     มารูนเข้ม (สีหลัก/ปุ่มที่เลือก)
        ink: colorFromVariable('--color-ink'), //       ตัวหนังสือหลัก
        soft: colorFromVariable('--color-soft'), //     ตัวหนังสือรอง (เทาอมชมพู)
        line: colorFromVariable('--color-line'), //     เส้นขอบ
        danger: colorFromVariable('--color-danger'), // สีเตือน/ลบ
      },
      fontFamily: {
        title: ['"Playfair Display"', 'Mali', 'serif'], //                   หัวข้อใหญ่
        cute: ['Mali', '"IBM Plex Sans Thai Looped"', 'sans-serif'], //       ตัวหนังสือน่ารัก
        typewriter: ['"IBM Plex Mono"', '"IBM Plex Sans Thai Looped"', 'monospace'], // แบบพิมพ์ดีด
        body: ['"IBM Plex Sans Thai Looped"', '-apple-system', 'system-ui', 'sans-serif'], // ข้อความทั่วไป
      },
      boxShadow: {
        // เงาแบบเลื่อนลงขวา เหมือนปุ่มในรูปตัวอย่าง
        pop: '3px 3px 0 0 rgb(var(--color-line))',
        'pop-dark': '3px 3px 0 0 rgb(var(--color-wine) / 0.35)',
        soft: '0 6px 24px -8px rgb(var(--color-wine) / 0.18)',
      },
      letterSpacing: {
        label: '0.25em', // ระยะห่างตัวอักษรของป้ายตัวเล็ก เช่น "CAPTURE"
      },
    },
  },
  plugins: [],
} satisfies Config

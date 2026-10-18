// =====================================================================
// themeTools.ts : สลับโหมด สว่าง / มืด / ตามเครื่อง
//
// ทำงานยังไง:
//   - ใส่ <html data-theme="dark"> หรือ "light" → สีใน src/index.css จะเปลี่ยนตาม
//   - จำค่าที่เลือกไว้ในเครื่อง (localStorage ชื่อ 'theme')
//   - เลือก "ตามเครื่อง" = ใช้ตามที่ตั้งไว้ในมือถือ/คอม และเปลี่ยนเองเมื่อเครื่องเปลี่ยน
//   - index.html มีสคริปต์สั้นๆ ใส่สีให้ก่อนเว็บโหลด (กันจอขาวแวบตอนเปิดโหมดมืด)
//
// ใช้งานในหน้าจอ:
//   const { themeChoice, shownTheme, chooseTheme } = useTheme()
//   chooseTheme('dark')
// =====================================================================
import { useEffect, useState } from 'react'

/** ค่าที่ผู้ใช้เลือก */
export type ThemeChoice = 'light' | 'dark' | 'auto'
/** โหมดที่แสดงอยู่จริง */
export type ShownTheme = 'light' | 'dark'

const SAVE_NAME = 'theme'
const CHANGE_EVENT = 'theme-changed'

/** สีแถบด้านบนของมือถือ (ต้องตรงกับสีพื้นหลัง --color-cream ใน index.css) */
const TOP_BAR_COLORS: Record<ShownTheme, string> = { light: '#F7F7F8', dark: '#111114' }

/** อ่านค่าที่เลือกไว้ (ไม่เคยเลือก = ตามเครื่อง) */
export function getThemeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(SAVE_NAME)
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved
  } catch {
    // เครื่องไม่ให้อ่าน → ใช้ค่าเริ่มต้น
  }
  return 'auto'
}

/** เครื่องตั้งเป็นโหมดมืดอยู่ไหม */
function isDeviceDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** แปลงค่าที่เลือก → โหมดที่จะแสดงจริง */
function toShownTheme(choice: ThemeChoice): ShownTheme {
  if (choice === 'auto') return isDeviceDark() ? 'dark' : 'light'
  return choice
}

/** เปลี่ยนสีหน้าเว็บตามค่าที่เลือก */
function showTheme(choice: ThemeChoice) {
  const shownTheme = toShownTheme(choice)
  document.documentElement.dataset.theme = shownTheme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', TOP_BAR_COLORS[shownTheme])
}

/** เลือกโหมดใหม่ + จำไว้ */
export function saveThemeChoice(choice: ThemeChoice) {
  try {
    localStorage.setItem(SAVE_NAME, choice)
  } catch {
    // จำไม่ได้ก็ไม่เป็นไร ยังเปลี่ยนสีได้
  }
  showTheme(choice)
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

/** เรียกครั้งเดียวตอนเปิดแอพ (ใน main.tsx) : ใส่สีให้ถูก + คอยฟังเมื่อเครื่องเปลี่ยนโหมด */
export function startTheme() {
  showTheme(getThemeChoice())
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemeChoice() !== 'auto') return
    showTheme('auto')
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  })
}

/** ใช้ในหน้าจอ : รู้ว่าตอนนี้โหมดอะไร + ฟังก์ชันเปลี่ยนโหมด */
export function useTheme() {
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>(getThemeChoice)
  const [shownTheme, setShownTheme] = useState<ShownTheme>(() => toShownTheme(getThemeChoice()))

  useEffect(() => {
    const whenThemeChanged = () => {
      setThemeChoice(getThemeChoice())
      setShownTheme(toShownTheme(getThemeChoice()))
    }
    window.addEventListener(CHANGE_EVENT, whenThemeChanged)
    return () => window.removeEventListener(CHANGE_EVENT, whenThemeChanged)
  }, [])

  return { themeChoice, shownTheme, chooseTheme: saveThemeChoice }
}

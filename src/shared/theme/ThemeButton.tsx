// =====================================================================
// ThemeButton : ปุ่มพระจันทร์/พระอาทิตย์ กดสลับโหมดมืด ↔ โหมดสว่าง
// (อยากเลือก "ตามเครื่อง" ไปที่หน้าตั้งค่า)
// ใช้งาน: <ThemeButton />
// =====================================================================
import { Moon, Sun } from 'lucide-react'
import { IconButton } from '@/shared/parts/RoundButton'
import { useTheme } from './themeTools'

export function ThemeButton({ className = '' }: { className?: string }) {
  const { shownTheme, chooseTheme } = useTheme()
  const isDark = shownTheme === 'dark'
  return (
    <IconButton
      label={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
      onClick={() => chooseTheme(isDark ? 'light' : 'dark')}
      className={className}
    >
      {isDark ? <Sun size={19} strokeWidth={1.7} /> : <Moon size={19} strokeWidth={1.7} />}
    </IconButton>
  )
}

/** แถวปุ่มเลือก สว่าง / มืด / ตามเครื่อง (ใช้ในหน้าตั้งค่า) */
export function ThemePicker() {
  const { themeChoice, chooseTheme } = useTheme()
  const choices = [
    { id: 'light', name: 'สว่าง', emoji: '☀️' },
    { id: 'dark', name: 'มืด', emoji: '🌙' },
    { id: 'auto', name: 'ตามเครื่อง', emoji: '📱' },
  ] as const
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="โหมดสี">
      {choices.map((choice) => {
        const isSelected = themeChoice === choice.id
        return (
          <button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => chooseTheme(choice.id)}
            className={`inline-flex h-10 items-center gap-2 rounded-full border-2 px-4 text-sm transition ${
              isSelected ? 'border-wine bg-wine text-paper' : 'border-line bg-paper text-ink hover:border-pink'
            }`}
          >
            <span aria-hidden="true">{choice.emoji}</span>
            {choice.name}
          </button>
        )
      })}
    </div>
  )
}

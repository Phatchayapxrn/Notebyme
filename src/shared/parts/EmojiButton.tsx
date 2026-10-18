// =====================================================================
// EmojiButton : ปุ่ม 😊 กดแล้วเปิดกล่องเลือก อีโมจิ / อิโมติคอน / ตัวตกแต่ง
// เลือกแล้วจะส่งตัวที่เลือกไปให้ onPick (กล่องยังเปิดอยู่ เลือกต่อได้หลายตัว)
//
// ใช้งาน:
//   <EmojiButton onPick={(emoji) => ใส่ emoji ตรงตำแหน่งที่พิมพ์อยู่} />
//
// อยากเพิ่มอีโมจิ: ใส่เพิ่มใน EMOJI_GROUPS ด้านล่าง
// =====================================================================
import { useState } from 'react'
import { Smile } from 'lucide-react'
import { PopupBox } from './PopupBox'

/** กลุ่มอีโมจิ (isWide = ตัวยาว เช่น อิโมติคอน / เส้นคั่น แสดงเป็นปุ่มกว้าง) */
const EMOJI_GROUPS: { id: string; name: string; items: string[]; isWide?: boolean }[] = [
  {
    id: 'face',
    name: 'หน้า',
    items: '😀 😁 😂 🤣 😊 🥰 😍 😘 😚 😋 😎 🤩 🥳 😇 🙂 😉 😌 😴 🤔 🤭 🫢 😮 😳 🥺 😢 😭 😤 😡 🤯 😱 🙄 😬 🤗 🫶 🙏 👍 👏 🙌 💪 ✌️ 🤞 👌 👋 🤟 👀'.split(' '),
  },
  {
    id: 'heart',
    name: 'หัวใจ',
    items: '❤️ 🩷 🧡 💛 💚 🩵 💙 💜 🤎 🖤 🩶 🤍 💖 💗 💓 💞 💕 💘 💝 💟 ❣️ ♡ ♥ ❥ 🌹 🌷 🌸 💐 🌼 🌻'.split(' '),
  },
  {
    id: 'shop',
    name: 'ร้านค้า',
    items: '🛍️ 🛒 📦 🚚 🛵 💸 💰 💵 🪙 💳 🧾 🏷️ 🎁 🎀 ✨ 🔥 ⭐ 🌟 💯 🆕 🆓 🔝 📣 📢 ⏰ ⏳ 📍 📞 📲 💬 📝 ✅ ☑️ ✔️ ❌ ⚠️ ❗ ❓ 👉 👇 📌 🔸 🔹 🔺 ⚡'.split(' '),
  },
  {
    id: 'cute',
    name: 'ตกแต่ง',
    items: '✿ ❀ ✾ ❁ ✧ ✦ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ⋆ ｡ ˚ ⊹ ₊ ‧ ° ☁ ☾ ☽ ☀ ☼ ♪ ♫ ❄ ❅ ◡ ꒰ ꒱ ⌒ ∞ • ◦ ▸ ▹ ➤ ➜ → ⇢ ✓ ✗ ☆ ★ ♢ ♦ ◇ ◆ ○ ●'.split(' '),
  },
  {
    id: 'line',
    name: 'เส้นคั่น',
    isWide: true,
    items: [
      '┈┈┈┈┈┈┈┈┈┈',
      '━━━━━━━━━━',
      '─── ⋆⋅☆⋅⋆ ───',
      '⋆｡˚ ☁︎ ˚｡⋆｡˚☽˚｡⋆',
      '✿ ┈┈┈┈┈┈┈ ✿',
      '・。・゜・。・゜・',
      '♡ ── ♡ ── ♡',
      '✧ ═══════ ✧',
      '꒰ ꒱',
      '【 】',
      '「 」',
      '『 』',
    ],
  },
  {
    id: 'kaomoji',
    name: 'อิโมติคอน',
    isWide: true,
    items: [
      '(◕‿◕)',
      '(｡♥‿♥｡)',
      'ʕ•ᴥ•ʔ',
      '(づ｡◕‿‿◕｡)づ',
      '(*^▽^*)',
      '(≧◡≦)',
      '٩(◕‿◕)۶',
      '(っ˘ω˘ς)',
      '(ᵔᴥᵔ)',
      '(✿◠‿◠)',
      '╰(*°▽°*)╯',
      '(ノ◕ヮ◕)ノ*:･ﾟ✧',
      '(๑˃ᴗ˂)ﻭ',
      '(╥﹏╥)',
      '(¬‿¬)',
      '¯\\_(ツ)_/¯',
      '(•‿•)',
      '♡(ˆ⌣ˆԅ)',
      '(˶ᵔ ᵕ ᵔ˶)',
      'ପ(๑•ᴗ•๑)ଓ ♡',
      '(っ◔◡◔)っ ♥',
      '(=^･ω･^=)',
      '(＾▽＾)',
      '(°ロ°) !',
      '(＞﹏＜)',
      '(｡･ω･｡)',
      '(*≧ω≦*)',
      '(´｡• ω •｡`)',
      '( ˘ ³˘)♥',
      '٩(๑❛ᴗ❛๑)۶',
    ],
  },
]

const RECENT_SAVE_NAME = 'recent-emoji'
const RECENT_LIMIT = 16

/** อ่านอีโมจิที่ใช้ล่าสุด (เก็บไว้ในเครื่อง) */
function getRecentEmoji(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_SAVE_NAME) ?? '[]')
    return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

/** จำอีโมจิที่เพิ่งใช้ */
function rememberEmoji(emoji: string): string[] {
  const newList = [emoji, ...getRecentEmoji().filter((item) => item !== emoji)].slice(0, RECENT_LIMIT)
  try {
    localStorage.setItem(RECENT_SAVE_NAME, JSON.stringify(newList))
  } catch {
    // จำไม่ได้ก็ไม่เป็นไร
  }
  return newList
}

/** true = เป็นตัวยาว (อิโมติคอน / เส้นคั่น) */
function isLongItem(emoji: string): boolean {
  return Array.from(emoji).length > 2
}

export function EmojiButton({ onPick }: { onPick: (emoji: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [groupId, setGroupId] = useState('face')
  const [recentList, setRecentList] = useState<string[]>(getRecentEmoji)

  const shownGroup = EMOJI_GROUPS.find((group) => group.id === groupId) ?? EMOJI_GROUPS[0]

  function pick(emoji: string) {
    onPick(emoji)
    setRecentList(rememberEmoji(emoji))
  }

  return (
    <>
      <button
        type="button"
        aria-label="ใส่อีโมจิ / อิโมติคอน"
        title="ใส่อีโมจิ / อิโมติคอน"
        onMouseDown={(event) => event.preventDefault()} // กันช่องพิมพ์เสียโฟกัส
        onClick={() => setIsOpen(true)}
        className="grid h-9 w-9 flex-none place-items-center rounded-xl text-soft transition hover:bg-blush hover:text-ink"
      >
        <Smile size={18} />
      </button>

      <PopupBox isOpen={isOpen} title="เลือกอีโมจิ" onClose={() => setIsOpen(false)}>
        {/* ใช้ล่าสุด */}
        {recentList.length > 0 && (
          <div className="mb-3">
            <p className="small-label mb-1.5">ใช้ล่าสุด</p>
            <div className="flex flex-wrap gap-1">
              {recentList.map((emoji) => (
                <PickButton key={emoji} emoji={emoji} isWide={isLongItem(emoji)} onPick={pick} />
              ))}
            </div>
          </div>
        )}

        {/* แท็บกลุ่ม */}
        <div className="hide-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto px-1" role="tablist">
          {EMOJI_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={group.id === groupId}
              onClick={() => setGroupId(group.id)}
              className={`h-8 flex-none rounded-full px-3 text-sm transition ${
                group.id === groupId ? 'bg-wine text-paper' : 'text-soft hover:bg-blush hover:text-ink'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* อีโมจิในกลุ่ม */}
        <div className="flex max-h-[45dvh] flex-wrap gap-1 overflow-y-auto">
          {shownGroup.items.map((emoji) => (
            <PickButton key={emoji} emoji={emoji} isWide={shownGroup.isWide} onPick={pick} />
          ))}
        </div>
        <p className="mt-3 text-xs text-soft">กดได้หลายตัว เสร็จแล้วกด ✕ เพื่อปิด</p>
      </PopupBox>
    </>
  )
}

/** ปุ่มอีโมจิ 1 ตัวในกล่อง */
function PickButton({ emoji, isWide, onPick }: { emoji: string; isWide?: boolean; onPick: (emoji: string) => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onPick(emoji)}
      className={`flex-none rounded-xl transition hover:bg-blush active:scale-95 ${
        isWide ? 'h-10 whitespace-nowrap border border-line px-3 text-sm text-ink' : 'grid h-10 w-10 place-items-center text-[22px]'
      }`}
    >
      {emoji}
    </button>
  )
}
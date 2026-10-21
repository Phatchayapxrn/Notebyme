// =====================================================================
// SearchBox : ช่องค้นหากลาง (กด Ctrl+K หรือ / หรือปุ่มแว่นขยาย) แบบ Google / Safari
//
//   - พิมพ์แล้วค้นข้ามทุกระบบที่ "คนนี้มีสิทธิ์เห็น" (ผ่าน searchItems ของแต่ละระบบ)
//   - ยังไม่พิมพ์ = ทางลัดไปหน้าต่างๆ / พิมพ์ชื่อเมนู = ไปหน้านั้นได้เลย
//   - ล่างสุดเสมอ: "ค้นหาบน Google" (ถ้าพิมพ์ลักษณะเป็นลิงก์ จะเป็น "เปิดเว็บ" แทน)
//   - ↑ ↓ เลือก / Enter เปิด / Esc ปิด
// =====================================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Globe, Search } from 'lucide-react'
import type { AppFeature, SearchResult } from '@/features/AppFeature'
import { looksLikeUrl } from './searchTools'

interface SearchBoxProps {
  isOpen: boolean
  onClose: () => void
  /** ระบบที่คนนี้เห็นได้ (PageLayout กรองให้แล้ว) */
  features: AppFeature[]
}

/** 1 แถวที่เลือกได้ในกล่องค้นหา */
interface Option {
  key: string
  title: string
  previewText?: string
  groupName: string
  /** ลิงก์ในแอพ หรือ ลิงก์เว็บนอก (isExternal) */
  link: string
  isExternal?: boolean
  icon?: AppFeature['menuIcon']
}

const DELAY_MS = 200

/** ทำตัวหนาเฉพาะส่วนที่ตรงกับคำค้น */
function Highlight({ text, keyword }: { text: string; keyword: string }) {
  const clean = keyword.trim()
  if (!clean) return <>{text}</>
  const index = text.toLowerCase().indexOf(clean.toLowerCase())
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-rose/25 px-0.5 text-inherit">{text.slice(index, index + clean.length)}</mark>
      {text.slice(index + clean.length)}
    </>
  )
}

export function SearchBox({ isOpen, onClose, features }: SearchBoxProps) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [groups, setGroups] = useState<{ feature: AppFeature; results: SearchResult[] }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const requestNumber = useRef(0)

  // เปิดกล่องทีไร เริ่มใหม่
  useEffect(() => {
    if (!isOpen) return
    setKeyword('')
    setGroups([])
    setActiveIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [isOpen])

  // พิมพ์เสร็จรอแป๊บ แล้วค้นทุกระบบพร้อมกัน (ระบบไหนค้นพัง ข้ามไป ไม่ให้ทั้งกล่องพัง)
  useEffect(() => {
    if (!isOpen) return
    const clean = keyword.trim()
    setActiveIndex(0)
    if (!clean) {
      setGroups([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const thisRequest = ++requestNumber.current
    const timer = window.setTimeout(async () => {
      const searchable = features.filter((feature) => feature.searchItems)
      const settled = await Promise.allSettled(searchable.map((feature) => feature.searchItems!(clean)))
      if (thisRequest !== requestNumber.current) return // มีคำค้นใหม่กว่าแล้ว ทิ้งผลเก่า
      setGroups(
        searchable
          .map((feature, index) => ({ feature, results: settled[index].status === 'fulfilled' ? (settled[index] as PromiseFulfilledResult<SearchResult[]>).value : [] }))
          .filter((group) => group.results.length > 0),
      )
      setIsSearching(false)
    }, DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [keyword, isOpen, features])

  // รวมทุกแถวที่เลือกได้ เรียงตามที่โชว์
  const options = useMemo(() => {
    const clean = keyword.trim()
    const list: Option[] = []

    // ทางลัดไปหน้าต่างๆ (ยังไม่พิมพ์ = ทุกหน้า / พิมพ์แล้ว = เฉพาะที่ชื่อตรง)
    for (const feature of features) {
      if (feature.isPublic || feature.showInMenu === false) continue
      if (clean && !feature.menuName.toLowerCase().includes(clean.toLowerCase())) continue
      list.push({ key: `page-${feature.id}`, title: feature.menuName, groupName: 'ไปที่หน้า', link: feature.mainPath, icon: feature.menuIcon })
    }

    for (const group of groups) {
      for (const result of group.results) {
        list.push({ key: `${group.feature.id}-${result.id}`, title: result.title, previewText: result.previewText, groupName: group.feature.menuName, link: result.link, icon: group.feature.menuIcon })
      }
    }

    if (clean) {
      if (looksLikeUrl(clean)) {
        list.push({ key: 'open-web', title: `เปิดเว็บ ${clean}`, groupName: 'เว็บ', link: /^https?:\/\//i.test(clean) ? clean : `https://${clean}`, isExternal: true })
      }
      list.push({ key: 'google', title: `ค้นหา “${clean}” บน Google`, groupName: 'เว็บ', link: `https://www.google.com/search?q=${encodeURIComponent(clean)}`, isExternal: true })
    }
    return list
  }, [keyword, groups, features])

  function openOption(option: Option) {
    onClose()
    if (option.isExternal) window.open(option.link, '_blank', 'noopener,noreferrer')
    else navigate(option.link)
  }

  function whenKeyPressed(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, options.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && options[activeIndex]) {
      event.preventDefault()
      openOption(options[activeIndex])
    }
  }

  // เลื่อนให้แถวที่เลือกอยู่ในจอ
  useEffect(() => {
    document.getElementById(`search-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[8dvh]" role="dialog" aria-modal="true" aria-label="ค้นหา" onKeyDown={whenKeyPressed}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[80dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={20} className="flex-none text-soft" aria-hidden="true" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent py-4 text-[17px] text-ink placeholder:text-soft/60 focus:outline-none"
            placeholder="ค้นหาในแอพ หรือค้นบนเว็บ"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-options"
            aria-activedescendant={options[activeIndex] ? `search-option-${activeIndex}` : undefined}
            aria-label="คำค้นหา"
            autoComplete="off"
            enterKeyHint="search"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-typewriter text-[11px] text-soft sm:block">Esc</kbd>
        </div>

        <ul id="search-options" role="listbox" className="flex-1 overflow-y-auto py-2">
          {options.map((option, index) => {
            const isNewGroup = index === 0 || options[index - 1].groupName !== option.groupName
            return (
              <li key={option.key} role="presentation">
                {isNewGroup && <p className="small-label px-4 pb-1 pt-3">{option.groupName}</p>}
                <button
                  id={`search-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => openOption(option)}
                  onMouseMove={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${index === activeIndex ? 'bg-blush' : ''}`}
                >
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-blush text-soft" aria-hidden="true">
                    {option.isExternal ? <Globe size={16} /> : option.icon ? <option.icon size={16} /> : <Search size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-ink">{option.groupName === 'เว็บ' ? option.title : <Highlight text={option.title} keyword={keyword} />}</span>
                    {option.previewText && (
                      <span className="block truncate text-sm text-soft">
                        <Highlight text={option.previewText} keyword={keyword} />
                      </span>
                    )}
                  </span>
                  {option.isExternal && <ExternalLink size={14} className="flex-none text-soft" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
          {isSearching && <li className="px-4 py-3 text-sm text-soft">กำลังค้นหา...</li>}
          {!isSearching && keyword.trim() && groups.length === 0 && <li className="px-4 py-3 text-sm text-soft">ไม่เจอในแอพ ลองค้นบนเว็บด้านบนได้</li>}
        </ul>
      </div>
    </div>,
    document.body,
  )
}

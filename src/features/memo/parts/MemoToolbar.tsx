// =====================================================================
// MemoToolbar : แถบเครื่องมือลอยเหนือคีย์บอร์ด (แบบโน๊ตไอโฟน)
//   โหมดหลัก  : Aa | เช็กลิสต์ | ตาราง | แนบรูป/วิดีโอ | ย้อนกลับ | ทำซ้ำ (+ ปุ่มจัดการตาราง ถ้าเคอร์เซอร์อยู่ในตาราง)
//   โหมด Aa   : ตัวหนา เอียง เส้นใต้ ขีดฆ่า ไฮไลต์ ลิงก์ หัวเรื่อง รายการ ตัวเลข อ้างอิง
//   โหมดลิงก์ : ช่องใส่ลิงก์
// แสดงเมื่อกำลังพิมพ์เท่านั้น และยกขึ้นตามความสูงของคีย์บอร์ดบนมือถือ
// =====================================================================
import { useEffect, useState, type ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Check,
  Heading2,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Paperclip,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from 'lucide-react'

type ToolbarMode = 'main' | 'format' | 'link'

interface MemoToolbarProps {
  editor: Editor | null
  /** กดปุ่มแนบรูป/วิดีโอ */
  onAttach: () => void
  isUploading: boolean
}

/** ระยะที่คีย์บอร์ดบนมือถือบังจออยู่ (px) เพื่อยกแถบเครื่องมือขึ้นไปเหนือคีย์บอร์ด */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => setHeight(Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop))
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])
  return height
}

export function MemoToolbar({ editor, onAttach, isUploading }: MemoToolbarProps) {
  const keyboardHeight = useKeyboardHeight()
  const [mode, setMode] = useState<ToolbarMode>('main')
  const [linkText, setLinkText] = useState('')
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [isToolbarFocused, setIsToolbarFocused] = useState(false)
  // ให้ toolbar ขึ้นใหม่ทุกครั้งที่ editor เปลี่ยนสถานะ (ตัวหนา/ตาราง ฯลฯ) จะได้ไฮไลต์ปุ่มถูก
  const [, setVersion] = useState(0)

  useEffect(() => {
    if (!editor) return
    const whenFocus = () => {
      setIsEditorFocused(true)
      setIsToolbarFocused(false) // โฟกัสกลับมาที่ editor แล้ว (กันค้างเมื่อช่องลิงก์ถูกถอดออก)
    }
    // หน่วงนิดหน่อย กันแถบกระพริบตอนโฟกัสย้ายจาก editor ไปช่องลิงก์
    const whenBlur = () => window.setTimeout(() => setIsEditorFocused(editor.isFocused), 120)
    const whenChange = () => setVersion((count) => count + 1)
    editor.on('focus', whenFocus)
    editor.on('blur', whenBlur)
    editor.on('transaction', whenChange)
    return () => {
      editor.off('focus', whenFocus)
      editor.off('blur', whenBlur)
      editor.off('transaction', whenChange)
    }
  }, [editor])

  if (!editor) return null
  if (!isEditorFocused && !isToolbarFocused) return null

  /** เปิดโหมดลิงก์ (ใส่ลิงก์เดิมให้ ถ้าคลุมข้อความที่เป็นลิงก์อยู่) */
  function openLinkMode() {
    setLinkText((editor?.getAttributes('link').href as string | undefined) ?? '')
    setMode('link')
  }

  /** ใส่ลิงก์ (ว่าง = เอาลิงก์ออก) */
  function applyLink() {
    const text = linkText.trim()
    if (!editor) return
    if (!text) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const href = /^(https?:|mailto:|tel:)/i.test(text) ? text : `https://${text}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    setMode('format')
  }

  const chain = () => editor.chain().focus()

  return (
    <div
      role="toolbar"
      aria-label="เครื่องมือจัดรูปแบบ"
      onFocus={() => setIsToolbarFocused(true)}
      onBlur={() => setIsToolbarFocused(false)}
      style={{ bottom: keyboardHeight }}
      className="fixed inset-x-0 z-30 px-3 pb-2"
    >
      <div className="hide-scrollbar mx-auto flex max-w-xl items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-paper/95 px-2 py-1.5 shadow-soft backdrop-blur">
        {mode === 'main' && (
          <>
            <ToolButton label="จัดรูปแบบข้อความ" onClick={() => setMode('format')}>
              <Type size={19} />
            </ToolButton>
            <ToolButton label="เช็กลิสต์" isOn={editor.isActive('taskList')} onClick={() => chain().toggleTaskList().run()}>
              <ListChecks size={19} />
            </ToolButton>
            <ToolButton
              label="ใส่ตาราง"
              isOn={editor.isActive('table')}
              onClick={() => chain().insertTable({ rows: 3, cols: 2, withHeaderRow: false }).run()}
            >
              <TableIcon size={19} />
            </ToolButton>
            <ToolButton label="แนบรูปหรือวิดีโอ" onClick={onAttach} isDisabled={isUploading}>
              <Paperclip size={19} />
            </ToolButton>

            {/* เคอร์เซอร์อยู่ในตาราง → ปุ่มจัดการตาราง */}
            {editor.isActive('table') && (
              <>
                <Divider />
                <TextButton label="เพิ่มแถว" onClick={() => chain().addRowAfter().run()} />
                <TextButton label="เพิ่มคอลัมน์" onClick={() => chain().addColumnAfter().run()} />
                <TextButton label="ลบแถว" onClick={() => chain().deleteRow().run()} />
                <TextButton label="ลบคอลัมน์" onClick={() => chain().deleteColumn().run()} />
                <TextButton label="ลบตาราง" onClick={() => chain().deleteTable().run()} />
              </>
            )}

            <Divider />
            <ToolButton label="ย้อนกลับ" onClick={() => chain().undo().run()} isDisabled={!editor.can().undo()}>
              <Undo2 size={19} />
            </ToolButton>
            <ToolButton label="ทำซ้ำ" onClick={() => chain().redo().run()} isDisabled={!editor.can().redo()}>
              <Redo2 size={19} />
            </ToolButton>
          </>
        )}

        {mode === 'format' && (
          <>
            <ToolButton label="กลับ" onClick={() => setMode('main')}>
              <X size={19} />
            </ToolButton>
            <Divider />
            <ToolButton label="ตัวหนา" isOn={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}>
              <Bold size={19} />
            </ToolButton>
            <ToolButton label="ตัวเอียง" isOn={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}>
              <Italic size={19} />
            </ToolButton>
            <ToolButton label="ขีดเส้นใต้" isOn={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}>
              <UnderlineIcon size={19} />
            </ToolButton>
            <ToolButton label="ขีดฆ่า" isOn={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}>
              <Strikethrough size={19} />
            </ToolButton>
            <ToolButton label="ไฮไลต์" isOn={editor.isActive('highlight')} onClick={() => chain().toggleHighlight().run()}>
              <Highlighter size={19} />
            </ToolButton>
            <ToolButton label="ลิงก์" isOn={editor.isActive('link')} onClick={openLinkMode}>
              <LinkIcon size={19} />
            </ToolButton>
            <Divider />
            <ToolButton label="หัวเรื่อง" isOn={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={19} />
            </ToolButton>
            <ToolButton label="รายการจุด" isOn={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>
              <List size={19} />
            </ToolButton>
            <ToolButton label="รายการเลข" isOn={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>
              <ListOrdered size={19} />
            </ToolButton>
            <ToolButton label="ข้อความอ้างอิง" isOn={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>
              <Quote size={19} />
            </ToolButton>
          </>
        )}

        {mode === 'link' && (
          <form
            className="flex w-full items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault()
              applyLink()
            }}
          >
            <ToolButton label="ยกเลิก" onClick={() => setMode('format')}>
              <X size={19} />
            </ToolButton>
            <input
              className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[16px] text-ink placeholder:text-soft/70 focus:outline-none"
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
              placeholder="วางลิงก์ (เว้นว่าง = เอาลิงก์ออก)"
              inputMode="url"
              autoFocus
              aria-label="ลิงก์"
            />
            <ToolButton label="ตกลง" onClick={applyLink}>
              <Check size={19} />
            </ToolButton>
          </form>
        )}
      </div>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-6 w-px flex-none bg-line" aria-hidden="true" />
}

/** ปุ่มไอคอน 1 ปุ่ม */
function ToolButton({
  label,
  isOn = false,
  isDisabled = false,
  onClick,
  children,
}: {
  label: string
  isOn?: boolean
  isDisabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isOn}
      disabled={isDisabled}
      onMouseDown={(event) => event.preventDefault()} // กันไม่ให้ editor เสียโฟกัส
      onClick={onClick}
      className={`grid h-10 w-10 flex-none place-items-center rounded-full transition disabled:opacity-30 ${
        isOn ? 'bg-wine text-paper' : 'text-ink hover:bg-blush'
      }`}
    >
      {children}
    </button>
  )
}

/** ปุ่มข้อความสั้นๆ (ใช้กับปุ่มจัดการตาราง) */
function TextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="h-10 flex-none whitespace-nowrap rounded-full px-3 text-sm text-ink transition hover:bg-blush"
    >
      {label}
    </button>
  )
}

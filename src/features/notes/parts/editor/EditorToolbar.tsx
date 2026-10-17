// =====================================================================
// EditorToolbar : แถบปุ่มจัดรูปแบบข้อความ + ใส่รูป/วิดีโอ (อยู่บน editor)
// =====================================================================
import { useRef, type ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Heading2, List, ListChecks, Quote, ImagePlus, Clapperboard, Undo2, Redo2 } from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
  /** เรียกเมื่อผู้ใช้เลือกไฟล์รูป/วิดีโอ */
  onChooseFiles: (files: File[]) => void
  isUploading: boolean
}

export function EditorToolbar({ editor, onChooseFiles, isUploading }: EditorToolbarProps) {
  const pictureInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  if (!editor) return null

  /** เมื่อเลือกไฟล์จากเครื่อง */
  function whenFilesChosen(fileList: FileList | null) {
    if (fileList && fileList.length > 0) onChooseFiles(Array.from(fileList))
  }

  return (
    <div
      role="toolbar"
      aria-label="จัดรูปแบบข้อความ"
      className="hide-scrollbar sticky top-0 z-10 -mx-4 flex items-center gap-0.5 overflow-x-auto border-b-[1.5px] border-line bg-paper/95 px-3 py-1.5 backdrop-blur sm:-mx-5 sm:px-4"
    >
      <ToolButton label="ตัวหนา" isOn={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={18} />
      </ToolButton>
      <ToolButton label="ตัวเอียง" isOn={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={18} />
      </ToolButton>
      <ToolButton
        label="หัวข้อ"
        isOn={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={18} />
      </ToolButton>
      <ToolButton label="รายการจุด" isOn={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={18} />
      </ToolButton>
      <ToolButton label="เช็คลิสต์" isOn={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ListChecks size={18} />
      </ToolButton>
      <ToolButton label="ข้อความอ้างอิง" isOn={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={18} />
      </ToolButton>

      <span className="mx-1 h-6 w-px flex-none bg-line" aria-hidden="true" />

      <ToolButton label="ใส่รูปภาพ" onClick={() => pictureInput.current?.click()} isDisabled={isUploading}>
        <ImagePlus size={18} />
      </ToolButton>
      <ToolButton label="ใส่วิดีโอ" onClick={() => videoInput.current?.click()} isDisabled={isUploading}>
        <Clapperboard size={18} />
      </ToolButton>

      <span className="mx-1 h-6 w-px flex-none bg-line" aria-hidden="true" />

      <ToolButton label="ย้อนกลับ" onClick={() => editor.chain().focus().undo().run()} isDisabled={!editor.can().undo()}>
        <Undo2 size={18} />
      </ToolButton>
      <ToolButton label="ทำซ้ำ" onClick={() => editor.chain().focus().redo().run()} isDisabled={!editor.can().redo()}>
        <Redo2 size={18} />
      </ToolButton>

      {/* ช่องเลือกไฟล์ (ซ่อนไว้ กดปุ่มด้านบนแทน) */}
      <input
        ref={pictureInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          whenFilesChosen(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={videoInput}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          whenFilesChosen(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}

/** ปุ่ม 1 ปุ่มในแถบเครื่องมือ */
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
      className={`grid h-9 w-9 flex-none place-items-center rounded-xl transition disabled:opacity-30 ${
        isOn ? 'bg-wine text-paper' : 'text-soft hover:bg-blush hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

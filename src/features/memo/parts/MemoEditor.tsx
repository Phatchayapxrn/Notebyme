// =====================================================================
// MemoEditor : ช่องเขียนโน๊ต (TipTap) + แถบเครื่องมือลอยเหนือคีย์บอร์ด
//
// ทำได้: ตัวหนา/เอียง/เส้นใต้/ขีดฆ่า/ไฮไลต์/ลิงก์/หัวเรื่อง/รายการ/เช็กลิสต์/ตาราง/แนบรูป-วิดีโอ
// แนบได้ 3 วิธี: กดปุ่มคลิป / วาง (Ctrl+V) / ลากไฟล์มาวาง
// บรรทัดแรกของโน๊ตคือชื่อโน๊ต (แสดงตัวใหญ่ ดู .memo-content ใน index.css)
// ลิงก์ในโน๊ต: กด Ctrl (หรือ ⌘) ค้างแล้วคลิกเพื่อเปิด
//
// ใช้งาน:
//   <MemoEditor startContent={...} onChange={(content, plainText) => ...}
//               uploadOneFile={uploadOneFile} isUploading={isUploading} />
// =====================================================================
import { useEffect, useRef } from 'react'
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import type { UploadedFile } from '@/shared/files/fileStorage'
import { PictureBlock } from '@/features/notes/parts/editor/PictureBlock'
import { VideoBlock } from '@/features/notes/parts/editor/VideoBlock'
import { MemoToolbar } from './MemoToolbar'

interface MemoEditorProps {
  /** เนื้อหาตอนเปิด (ใช้แค่ครั้งแรก) */
  startContent: JSONContent | null
  /** เรียกทุกครั้งที่เนื้อหาเปลี่ยน */
  onChange: (content: JSONContent, plainText: string) => void
  /** ฟังก์ชันอัปโหลดไฟล์ (มาจาก useUploadFile) */
  uploadOneFile: (file: File) => Promise<UploadedFile | null>
  isUploading: boolean
  /** true = โฟกัสช่องพิมพ์ให้เลยตอนเปิด (ใช้กับโน๊ตใหม่) */
  autoFocus?: boolean
}

/** เอาเฉพาะไฟล์รูป/วิดีโอ */
function pickMediaFiles(fileList: FileList | null | undefined): File[] {
  return Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
}

export function MemoEditor({ startContent, onChange, uploadOneFile, isUploading, autoFocus }: MemoEditorProps) {
  // เก็บฟังก์ชันล่าสุดไว้ใน ref เพราะ editor ถูกสร้างแค่ครั้งเดียว
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const uploadRef = useRef(uploadOneFile)
  uploadRef.current = uploadOneFile
  const editorRef = useRef<Editor | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  /** อัปโหลดหลายไฟล์ แล้วใส่ลงใน editor ตามลำดับ */
  async function addFilesToMemo(files: File[]) {
    for (const file of files) {
      const uploaded = await uploadRef.current(file)
      const editor = editorRef.current
      if (!uploaded || !editor) continue
      const isVideo = uploaded.fileType.startsWith('video/')
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: isVideo ? 'video' : 'picture',
            attrs: isVideo
              ? { filePath: uploaded.filePath }
              : { filePath: uploaded.filePath, width: uploaded.width ?? null, height: uploaded.height ?? null },
          },
          { type: 'paragraph' },
        ])
        .run()
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: 'เริ่มพิมพ์ได้เลย บรรทัดแรกจะเป็นชื่อโน๊ต' }),
      Underline,
      Highlight,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      PictureBlock,
      VideoBlock,
    ],
    content: startContent ?? '',
    autofocus: autoFocus ? 'end' : false,
    // ตอนคัดลอกข้อความออกไปวางที่อื่น: คั่นแต่ละบรรทัดด้วยการขึ้นบรรทัดใหม่ 1 ครั้ง
    coreExtensionOptions: { clipboardTextSerializer: { blockSeparator: '\n' } },
    editorProps: {
      attributes: { class: 'note-content memo-content', 'aria-label': 'เนื้อหาโน๊ต' },
      // Ctrl/⌘ + คลิกลิงก์ = เปิดลิงก์
      handleClick: (_view, _pos, event) => {
        const link = (event.target as HTMLElement).closest('a')
        if (link && (event.ctrlKey || event.metaKey)) {
          window.open(link.href, '_blank', 'noopener,noreferrer')
          return true
        }
        return false
      },
      // วางรูปจาก clipboard (Ctrl+V)
      handlePaste: (_view, event) => {
        const files = pickMediaFiles(event.clipboardData?.files)
        if (files.length === 0) return false
        event.preventDefault()
        addFilesToMemo(files)
        return true
      },
      // ลากไฟล์มาวาง
      handleDrop: (_view, event, _slice, isMovedInside) => {
        if (isMovedInside) return false
        const files = pickMediaFiles((event as DragEvent).dataTransfer?.files)
        if (files.length === 0) return false
        event.preventDefault()
        addFilesToMemo(files)
        return true
      },
    },
    onUpdate: ({ editor: changedEditor }) => {
      onChangeRef.current(changedEditor.getJSON(), changedEditor.getText({ blockSeparator: '\n' }))
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  return (
    <div>
      {isUploading && (
        <div className="mb-3 overflow-hidden rounded-full bg-blush" role="status" aria-label="กำลังอัปโหลด">
          <div className="h-1.5 w-1/3 animate-[upload-slide_1.2s_ease-in-out_infinite] rounded-full bg-rose" />
        </div>
      )}
      <EditorContent editor={editor} />

      <MemoToolbar editor={editor} onAttach={() => fileInput.current?.click()} isUploading={isUploading} />

      {/* ช่องเลือกไฟล์ (ซ่อนไว้ อยู่นอกแถบเครื่องมือ เพราะแถบจะหายตอนเปิดหน้าต่างเลือกไฟล์) */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = pickMediaFiles(event.target.files)
          if (files.length > 0) addFilesToMemo(files)
          event.target.value = ''
        }}
      />
    </div>
  )
}

// =====================================================================
// NoteEditor : ช่องเขียนเนื้อหาโน๊ต (ใช้ TipTap)
//
// ทำได้: ตัวหนา/เอียง, หัวข้อ, รายการ, เช็คลิสต์, ใส่รูป/วิดีโอ
// ใส่รูปได้ 3 วิธี: กดปุ่มในแถบเครื่องมือ / วาง (Ctrl+V) / ลากไฟล์มาวาง
//
// ใช้งาน:
//   <NoteEditor
//     startContent={note.content}
//     onChange={(content, plainText) => ...}
//     uploadOneFile={uploadOneFile}
//     isUploading={isUploading}
//   />
// =====================================================================
import { useEffect, useRef } from 'react'
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import type { UploadedFile } from '@/shared/files/fileStorage'
import { PictureBlock } from './PictureBlock'
import { VideoBlock } from './VideoBlock'
import { EditorToolbar } from './EditorToolbar'

interface NoteEditorProps {
  /** เนื้อหาตอนเปิด (ใช้แค่ครั้งแรก) */
  startContent: JSONContent | null
  /** เรียกทุกครั้งที่เนื้อหาเปลี่ยน */
  onChange: (content: JSONContent, plainText: string) => void
  /** ฟังก์ชันอัปโหลดไฟล์ (มาจาก useUploadFile) */
  uploadOneFile: (file: File) => Promise<UploadedFile | null>
  isUploading: boolean
}

export function NoteEditor({ startContent, onChange, uploadOneFile, isUploading }: NoteEditorProps) {
  // เก็บฟังก์ชันล่าสุดไว้ใน ref เพราะ editor ถูกสร้างแค่ครั้งเดียว
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const uploadRef = useRef(uploadOneFile)
  uploadRef.current = uploadOneFile
  const editorRef = useRef<Editor | null>(null)

  /** อัปโหลดหลายไฟล์ แล้วใส่ลงใน editor ตามลำดับ */
  async function addFilesToNote(files: File[]) {
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

  /** เอาเฉพาะไฟล์รูป/วิดีโอ */
  function pickMediaFiles(fileList: FileList | null | undefined): File[] {
    return Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: 'เขียนไอเดียตรงนี้... (วางรูปหรือลากไฟล์มาใส่ได้เลย)' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      PictureBlock,
      VideoBlock,
    ],
    content: startContent ?? '',
    editorProps: {
      attributes: { class: 'note-content', 'aria-label': 'เนื้อหาไอเดีย' },
      // วางรูปจาก clipboard (Ctrl+V)
      handlePaste: (_view, event) => {
        const files = pickMediaFiles(event.clipboardData?.files)
        if (files.length === 0) return false
        event.preventDefault()
        addFilesToNote(files)
        return true
      },
      // ลากไฟล์มาวาง
      handleDrop: (_view, event, _slice, isMovedInside) => {
        if (isMovedInside) return false
        const files = pickMediaFiles((event as DragEvent).dataTransfer?.files)
        if (files.length === 0) return false
        event.preventDefault()
        addFilesToNote(files)
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
      <EditorToolbar editor={editor} onChooseFiles={addFilesToNote} isUploading={isUploading} />
      {isUploading && (
        <div className="mt-3 overflow-hidden rounded-full bg-blush" role="status" aria-label="กำลังอัปโหลด">
          <div className="h-1.5 w-1/3 animate-[upload-slide_1.2s_ease-in-out_infinite] rounded-full bg-rose" />
        </div>
      )}
      <EditorContent editor={editor} className="pt-4" />
    </div>
  )
}

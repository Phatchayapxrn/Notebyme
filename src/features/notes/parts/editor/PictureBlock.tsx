// =====================================================================
// PictureBlock : บล็อก "รูปภาพ" ใน editor ของโน๊ต
// เก็บแค่ path ไฟล์ไว้ในเนื้อหา แล้วขอลิงก์เปิดรูปตอนแสดงผล
// (เพราะถังเก็บไฟล์เป็นแบบส่วนตัว ลิงก์จะหมดอายุ จึงเก็บลิงก์ไว้ตรงๆ ไม่ได้)
// =====================================================================
import { Node, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { Trash2, ImageOff } from 'lucide-react'
import { useFileLink } from '@/shared/files/useFileLink'

/** หน้าตาของรูปตอนแสดงใน editor */
function PictureView({ node, selected, deleteNode, editor }: NodeViewProps) {
  const { filePath, width, height } = node.attrs as { filePath: string; width: number | null; height: number | null }
  const { link, isBroken } = useFileLink(filePath)

  return (
    <NodeViewWrapper className="relative my-3" data-drag-handle>
      <div
        className={`overflow-hidden rounded-2xl border-[1.5px] bg-blush/50 transition ${selected ? 'border-wine ring-2 ring-wine/30' : 'border-line'}`}
        style={width && height && !link ? { aspectRatio: `${width} / ${height}` } : undefined}
      >
        {isBroken ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-soft">
            <ImageOff size={18} /> เปิดรูปไม่ได้
          </div>
        ) : link ? (
          <img src={link} alt="" className="mx-auto block max-h-[70vh] w-auto max-w-full" draggable={false} />
        ) : (
          <div className="h-40 animate-pulse" />
        )}
      </div>
      {selected && editor.isEditable && (
        <button
          type="button"
          onClick={deleteNode}
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-wine px-3 py-1.5 text-xs text-paper shadow-soft"
        >
          <Trash2 size={14} /> เอารูปออก
        </button>
      )}
    </NodeViewWrapper>
  )
}

/** ตัวบล็อกรูป (ลงทะเบียนใน editor) */
export const PictureBlock = Node.create({
  name: 'picture',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      filePath: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-file-path'),
        renderHTML: (attributes) => ({ 'data-file-path': attributes.filePath }),
      },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-file-path]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PictureView)
  },
})

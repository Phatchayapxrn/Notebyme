// =====================================================================
// VideoBlock : บล็อก "วิดีโอ" ใน editor ของโน๊ต (หลักการเดียวกับ PictureBlock)
// =====================================================================
import { Node, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { Trash2, VideoOff } from 'lucide-react'
import { useFileLink } from '@/shared/files/useFileLink'

/** หน้าตาของวิดีโอตอนแสดงใน editor */
function VideoView({ node, selected, deleteNode, editor }: NodeViewProps) {
  const { filePath } = node.attrs as { filePath: string }
  const { link, isBroken } = useFileLink(filePath)

  return (
    <NodeViewWrapper className="relative my-3" data-drag-handle>
      <div className={`overflow-hidden rounded-2xl border-[1.5px] bg-wine/90 ${selected ? 'border-wine ring-2 ring-wine/30' : 'border-line'}`}>
        {isBroken ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-paper/80">
            <VideoOff size={18} /> เปิดวิดีโอไม่ได้
          </div>
        ) : link ? (
          <video src={link} controls playsInline preload="metadata" className="mx-auto block max-h-[70vh] w-full" />
        ) : (
          <div className="h-48 animate-pulse" />
        )}
      </div>
      {editor.isEditable && (
        <button
          type="button"
          onClick={deleteNode}
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-full bg-paper/95 px-3 py-1.5 text-xs text-wine shadow-soft transition ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100 focus:opacity-100'}`}
        >
          <Trash2 size={14} /> เอาวิดีโอออก
        </button>
      )}
    </NodeViewWrapper>
  )
}

/** ตัวบล็อกวิดีโอ (ลงทะเบียนใน editor) */
export const VideoBlock = Node.create({
  name: 'video',
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
    }
  },

  parseHTML() {
    return [{ tag: 'video[data-file-path]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', HTMLAttributes]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView)
  },
})

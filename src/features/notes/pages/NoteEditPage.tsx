// =====================================================================
// NoteEditPage : หน้าเขียน / แก้ไขไอเดีย 1 อัน (/notes/:noteId)
//
// การบันทึก:
//   - บันทึกเองอัตโนมัติ หลังหยุดพิมพ์ 0.8 วินาที
//   - กดปุ่ม "บันทึก" (หรือ Ctrl+S) เพื่อบันทึกทันที
//   - ถ้าเน็ตหลุด จะเก็บร่างไว้ในเครื่อง เปิดใหม่จะกู้กลับมาให้
//
// ตอนออกจากหน้านี้:
//   - ถ้าไอเดียว่างเปล่า (ไม่มีหัวข้อ ไม่มีเนื้อหา) จะลบทิ้งให้เลย
//   - รูป/วิดีโอที่เอาออกจากเนื้อหาแล้ว จะถูกลบไฟล์ทิ้ง (ประหยัดพื้นที่)
// =====================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { JSONContent } from '@tiptap/react'
import { ChevronLeft, Pin, PinOff, Trash2, Save } from 'lucide-react'
import { useAutoSave, getDraft, deleteDraft } from '@/shared/data/useAutoSave'
import { useUploadFile } from '@/shared/files/useUploadFile'
import { deleteUnusedFiles, getFilesOf } from '@/shared/files/fileStorage'
import { GroupPicker } from '@/shared/groups/GroupPicker'
import { WindowBox } from '@/shared/parts/WindowBox'
import { RoundButton, IconButton } from '@/shared/parts/RoundButton'
import { SaveStatusText } from '@/shared/parts/SaveStatusText'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { showShortDate } from '@/shared/dateTools'
import { deleteNoteForever, getOneNote, moveNoteToTrash, saveNote } from '../database'
import { NoteEditor } from '../parts/editor/NoteEditor'
import { getFilePathsInContent, getFirstPicture } from '../parts/editor/contentTools'
import type { NoteChanges } from '../types'

export function NoteEditPage() {
  const { noteId = '' } = useParams()
  const navigate = useNavigate()
  const showMessage = useShowMessage()
  const draftName = `note-${noteId}`

  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [startContent, setStartContent] = useState<JSONContent | null>(null)
  const [updatedAt, setUpdatedAt] = useState('')
  const [noteData, setNoteData] = useState<NoteChanges>({
    title: '',
    content: null,
    plainText: '',
    firstPicture: null,
    groupId: null,
    isPinned: false,
  })

  // ---------- โหลดไอเดียตอนเปิดหน้า ----------
  useEffect(() => {
    let isStillHere = true
    getOneNote(noteId)
      .then((note) => {
        if (!isStillHere) return
        if (!note) {
          setIsNotFound(true)
          return
        }
        let loadedData: NoteChanges = {
          title: note.title,
          content: note.content,
          plainText: note.plainText,
          firstPicture: note.firstPicture,
          groupId: note.groupId,
          isPinned: note.isPinned,
        }
        // มีร่างในเครื่องที่ใหม่กว่า (เคยบันทึกไม่สำเร็จ) ใช้ร่างนั้นแทน
        const draft = getDraft<NoteChanges>(draftName)
        if (draft && draft.savedTime > Date.parse(note.updatedAt)) {
          loadedData = draft.value
          showMessage('กู้ข้อความที่ยังไม่ได้บันทึกกลับมาแล้ว')
        } else if (draft) {
          deleteDraft(draftName)
        }
        setNoteData(loadedData)
        setStartContent(loadedData.content)
        setUpdatedAt(note.updatedAt)
      })
      .catch((error) => showMessage(error instanceof Error ? error.message : 'โหลดไม่สำเร็จ', 'error'))
      .finally(() => isStillHere && setIsLoading(false))
    return () => {
      isStillHere = false
    }
  }, [noteId, draftName, showMessage])

  // ---------- บันทึกอัตโนมัติ ----------
  const { saveStatus, saveNow } = useAutoSave({
    value: noteData,
    saveValue: (value) => saveNote(noteId, value),
    isReady: !isLoading && !isNotFound,
    draftName,
  })

  /** กดปุ่มบันทึก */
  const pressSaveButton = useCallback(async () => {
    const isSuccess = await saveNow()
    if (isSuccess) showMessage('บันทึกแล้ว')
    else showMessage('บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error')
  }, [saveNow, showMessage])

  // Ctrl+S / Cmd+S = บันทึก
  useEffect(() => {
    const whenKeyPressed = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        pressSaveButton()
      }
    }
    window.addEventListener('keydown', whenKeyPressed)
    return () => window.removeEventListener('keydown', whenKeyPressed)
  }, [pressSaveButton])

  // ---------- อัปโหลดรูป/วิดีโอ ----------
  const { uploadOneFile, isUploading } = useUploadFile({ belongsToType: 'note', belongsToId: noteId })

  // ---------- เก็บกวาดตอนออกจากหน้า ----------
  const latestNoteData = useRef(noteData)
  latestNoteData.current = noteData
  const isMovedToTrash = useRef(false)
  const isPageOpen = useRef(false)
  useEffect(() => {
    isPageOpen.current = true
    return () => {
      isPageOpen.current = false
      // รอแป๊บหนึ่งก่อน: ตอนพัฒนา React จะปิด-เปิดหน้าซ้ำ 1 ครั้ง (StrictMode)
      // ถ้าหน้ากลับมาเปิดอีก แปลว่ายังไม่ได้ออกจริง ไม่ต้องเก็บกวาด
      window.setTimeout(() => {
        if (!isPageOpen.current) cleanUpAfterLeaving()
      }, 0)
    }

    function cleanUpAfterLeaving() {
      if (isMovedToTrash.current) return
      const lastData = latestNoteData.current
      const usedFilePaths = getFilePathsInContent(lastData.content)
      const isEmptyNote = !lastData.title.trim() && !lastData.plainText.trim() && usedFilePaths.length === 0
      const owner = { belongsToType: 'note', belongsToId: noteId }
      if (isEmptyNote) {
        // ไอเดียว่างเปล่า: ลบทิ้ง (ถ้าไม่มีไฟล์แนบค้างอยู่)
        getFilesOf(owner)
          .then((filePaths) => (filePaths.length === 0 ? deleteNoteForever(noteId) : undefined))
          .catch(() => {})
      } else {
        // ลบไฟล์ที่ไม่ได้ใช้แล้ว
        deleteUnusedFiles(owner, usedFilePaths).catch(() => {})
      }
    }
  }, [noteId])

  /** เปลี่ยนข้อมูลบางส่วน */
  function changeNote(changes: Partial<NoteChanges>) {
    setNoteData((oldData) => ({ ...oldData, ...changes }))
  }

  /** ย้ายไปถังขยะ */
  async function moveToTrash() {
    try {
      await saveNow()
      await moveNoteToTrash(noteId)
      isMovedToTrash.current = true
      showMessage('ย้ายไปถังขยะแล้ว (กู้คืนได้ใน 30 วัน)')
      navigate('/notes')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  if (isLoading) return <LoadingDots />
  if (isNotFound) {
    return (
      <EmptyMessage emoji="🫥" title="ไม่เจอไอเดียนี้" text="อาจถูกลบไปแล้ว หรืออยู่ในถังขยะ">
        <RoundButton look="main" onClick={() => navigate('/notes')}>
          กลับไปหน้าไอเดีย
        </RoundButton>
      </EmptyMessage>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* แถวบน: ย้อนกลับ / สถานะ / ปุ่มต่างๆ */}
      <div className="flex items-center gap-2">
        <Link to="/notes" className="-ml-2 flex items-center gap-0.5 rounded-full px-2 py-2 text-[15px] text-wine hover:bg-blush">
          <ChevronLeft size={20} /> ไอเดีย
        </Link>
        <div className="flex-1" />
        <SaveStatusText saveStatus={saveStatus} />
        <IconButton label={noteData.isPinned ? 'เลิกปักหมุด' : 'ปักหมุด'} onClick={() => changeNote({ isPinned: !noteData.isPinned })}>
          {noteData.isPinned ? <PinOff size={19} /> : <Pin size={19} />}
        </IconButton>
        <IconButton label="ย้ายไปถังขยะ" onClick={moveToTrash}>
          <Trash2 size={19} />
        </IconButton>
        <RoundButton look="main" size="small" icon={<Save size={16} />} onClick={pressSaveButton} disabled={saveStatus === 'saving'}>
          บันทึก
        </RoundButton>
      </div>

      <WindowBox title={`${noteData.title.trim() || 'untitled'}.txt`} insideClassName="px-4 pb-8 pt-4 sm:px-5">
        {/* หมวด */}
        <div className="mb-3">
          <p className="small-label mb-2">หมวด</p>
          <GroupPicker selectedGroupId={noteData.groupId} onSelect={(groupId) => changeNote({ groupId })} />
        </div>

        {/* หัวข้อ */}
        <input
          className="w-full bg-transparent py-2 font-title text-3xl font-semibold text-wine placeholder:text-pink focus:outline-none sm:text-4xl"
          value={noteData.title}
          onChange={(event) => changeNote({ title: event.target.value })}
          placeholder="ตั้งชื่อไอเดีย"
          aria-label="หัวข้อไอเดีย"
          autoFocus={!noteData.title && !noteData.plainText}
        />
        {updatedAt && <p className="mb-2 font-typewriter text-xs text-soft">แก้ล่าสุด {showShortDate(updatedAt)}</p>}

        {/* เนื้อหา */}
        <NoteEditor
          startContent={startContent}
          onChange={(content, plainText) => changeNote({ content, plainText, firstPicture: getFirstPicture(content) })}
          uploadOneFile={uploadOneFile}
          isUploading={isUploading}
        />
      </WindowBox>
    </div>
  )
}

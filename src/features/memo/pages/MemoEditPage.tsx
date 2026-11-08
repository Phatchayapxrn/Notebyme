// =====================================================================
// MemoEditPage : หน้าเขียน / แก้ไขโน๊ต 1 อัน (/memo/:memoId) แบบโน๊ตไอโฟน
//
// การบันทึก:
//   - บันทึกเองอัตโนมัติหลังหยุดพิมพ์ (กดปุ่ม ✓ เพื่อบันทึกทันทีแล้วเก็บคีย์บอร์ด)
//   - ถ้าเน็ตหลุด จะเก็บร่างไว้ในเครื่อง เปิดใหม่จะกู้กลับมาให้
// ตอนออกจากหน้านี้:
//   - ถ้าโน๊ตว่างเปล่า (ไม่มีข้อความ ไม่มีรูป) จะลบทิ้งให้เลย
//   - รูป/วิดีโอที่เอาออกจากเนื้อหาแล้ว จะถูกลบไฟล์ทิ้ง (ประหยัดพื้นที่)
// =====================================================================
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { JSONContent } from '@tiptap/react'
import { Check, ChevronLeft, FolderInput, Pin, PinOff, Trash2 } from 'lucide-react'
import { deleteDraft, getDraft, useAutoSave } from '@/shared/data/useAutoSave'
import { deleteUnusedFiles } from '@/shared/files/fileStorage'
import { useUploadFile } from '@/shared/files/useUploadFile'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { PopupBox } from '@/shared/parts/PopupBox'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import { IconButton, RoundButton } from '@/shared/parts/RoundButton'
import { SaveStatusText } from '@/shared/parts/SaveStatusText'
import { getFilePathsInContent } from '@/features/notes/parts/editor/contentTools'
import {
  MEMO_FILE_TYPE,
  deleteMemoForever,
  getAllFolders,
  getOneMemo,
  moveMemoToFolder,
  moveMemoToTrash,
  saveMemoContent,
  setMemoPinned,
} from '../database'
import { MemoEditor } from '../parts/MemoEditor'
import type { MemoContent, MemoFolder } from '../types'

/** ข้อมูลของโน๊ตที่ไม่ได้บันทึกอัตโนมัติ (เปลี่ยนแล้วบันทึกทันทีที่กดปุ่ม) */
interface MemoInfo {
  isPinned: boolean
  folderId: string | null
  updatedAt: string
}

export function MemoEditPage() {
  const { memoId = '' } = useParams()
  const navigate = useNavigate()
  const showMessage = useShowMessage()
  const draftName = `memo-${memoId}`

  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isNewMemo, setIsNewMemo] = useState(false)
  const [startContent, setStartContent] = useState<JSONContent | null>(null)
  const [memoData, setMemoData] = useState<MemoContent>({ content: null, plainText: '' })
  const [info, setInfo] = useState<MemoInfo>({ isPinned: false, folderId: null, updatedAt: '' })
  const [folders, setFolders] = useState<MemoFolder[]>([])
  const [isFolderBoxOpen, setIsFolderBoxOpen] = useState(false)

  // ---------- โหลดโน๊ตตอนเปิดหน้า ----------
  useEffect(() => {
    let isStillHere = true
    Promise.all([getOneMemo(memoId), getAllFolders()])
      .then(([memo, allFolders]) => {
        if (!isStillHere) return
        setFolders(allFolders)
        if (!memo) {
          setIsNotFound(true)
          return
        }
        let loaded: MemoContent = { content: memo.content, plainText: memo.plainText }
        // มีร่างในเครื่องที่ใหม่กว่า (เคยบันทึกไม่สำเร็จ) ใช้ร่างนั้นแทน
        const draft = getDraft<MemoContent>(draftName)
        if (draft && draft.savedTime > Date.parse(memo.updatedAt)) {
          loaded = draft.value
          showMessage('กู้ข้อความที่ยังไม่ได้บันทึกกลับมาแล้ว')
        } else if (draft) {
          deleteDraft(draftName)
        }
        setMemoData(loaded)
        setStartContent(loaded.content)
        setIsNewMemo(!loaded.plainText.trim())
        setInfo({ isPinned: memo.isPinned, folderId: memo.folderId, updatedAt: memo.updatedAt })
      })
      .catch((error) => showMessage(error instanceof Error ? error.message : 'โหลดไม่สำเร็จ', 'error'))
      .finally(() => isStillHere && setIsLoading(false))
    return () => {
      isStillHere = false
    }
  }, [memoId, draftName, showMessage])

  // ---------- บันทึกอัตโนมัติ ----------
  const { saveStatus, saveNow } = useAutoSave({
    value: memoData,
    saveValue: (value) => saveMemoContent(memoId, value),
    isReady: !isLoading && !isNotFound,
    draftName,
  })

  // ---------- อัปโหลดรูป/วิดีโอ ----------
  const { uploadOneFile, isUploading } = useUploadFile({ belongsToType: MEMO_FILE_TYPE, belongsToId: memoId })

  // ---------- เก็บกวาดตอนออกจากหน้า ----------
  const latestData = useRef(memoData)
  latestData.current = memoData
  const isMovedToTrash = useRef(false)
  const isPageOpen = useRef(false)
  useEffect(() => {
    isPageOpen.current = true
    return () => {
      isPageOpen.current = false
      // รอแป๊บหนึ่งก่อน: ตอนพัฒนา React จะปิด-เปิดหน้าซ้ำ 1 ครั้ง (StrictMode)
      window.setTimeout(() => {
        if (!isPageOpen.current) cleanUpAfterLeaving()
      }, 0)
    }

    function cleanUpAfterLeaving() {
      if (isMovedToTrash.current) return
      const lastData = latestData.current
      const usedFilePaths = getFilePathsInContent(lastData.content)
      const isEmptyMemo = !lastData.plainText.trim() && usedFilePaths.length === 0
      if (isEmptyMemo) deleteMemoForever(memoId).catch(() => {})
      else deleteUnusedFiles({ belongsToType: MEMO_FILE_TYPE, belongsToId: memoId }, usedFilePaths).catch(() => {})
    }
  }, [memoId])

  /** กลับหน้ารายการ (ถ้ามีหน้าก่อนหน้าในแอพ ย้อนกลับไปหน้านั้น) */
  function goBack() {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate('/memo')
  }

  /** กดปุ่ม ✓ : บันทึกทันที แล้วเก็บคีย์บอร์ด */
  async function finish() {
    const isSuccess = await saveNow()
    if (!isSuccess) showMessage('บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ', 'error')
    ;(document.activeElement as HTMLElement | null)?.blur()
  }

  async function togglePin() {
    try {
      await setMemoPinned(memoId, !info.isPinned)
      setInfo((old) => ({ ...old, isPinned: !old.isPinned }))
      showMessage(info.isPinned ? 'เลิกปักหมุดแล้ว' : 'ปักหมุดแล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ไม่สำเร็จ', 'error')
    }
  }

  async function chooseFolder(folderId: string | null) {
    try {
      await moveMemoToFolder(memoId, folderId)
      setInfo((old) => ({ ...old, folderId }))
      setIsFolderBoxOpen(false)
      showMessage('ย้ายโฟลเดอร์แล้ว')
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ย้ายไม่สำเร็จ', 'error')
    }
  }

  async function moveToTrash() {
    try {
      await saveNow()
      await moveMemoToTrash(memoId)
      isMovedToTrash.current = true
      showMessage('ย้ายไปถังขยะแล้ว (กู้คืนได้ใน 30 วัน)')
      navigate('/memo', { replace: true })
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    }
  }

  if (isLoading) return <LoadingDots />
  if (isNotFound) {
    return (
      <EmptyMessage emoji="🫥" title="ไม่เจอโน๊ตนี้" text="อาจถูกลบไปแล้ว หรืออยู่ในถังขยะ">
        <RoundButton look="main" onClick={() => navigate('/memo')}>
          กลับไปหน้าโน๊ต
        </RoundButton>
      </EmptyMessage>
    )
  }

  const currentFolder = folders.find((folder) => folder.id === info.folderId)

  return (
    <div className="flex flex-col gap-3 pb-28">
      {/* แถวบน: ย้อนกลับ / สถานะ / ปุ่มต่างๆ / เสร็จ */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goBack}
          className="-ml-2 flex items-center gap-0.5 rounded-full px-2 py-2 text-[15px] text-wine hover:bg-blush"
        >
          <ChevronLeft size={20} /> โน๊ต
        </button>
        <div className="flex-1" />
        <SaveStatusText saveStatus={saveStatus} />
        <IconButton label="ย้ายโฟลเดอร์" onClick={() => setIsFolderBoxOpen(true)}>
          <FolderInput size={19} />
        </IconButton>
        <IconButton label={info.isPinned ? 'เลิกปักหมุด' : 'ปักหมุด'} onClick={togglePin}>
          {info.isPinned ? <PinOff size={19} /> : <Pin size={19} />}
        </IconButton>
        <IconButton label="ย้ายไปถังขยะ" onClick={moveToTrash}>
          <Trash2 size={19} />
        </IconButton>
        <IconButton label="เสร็จ บันทึกแล้วเก็บคีย์บอร์ด" onClick={finish}>
          <Check size={20} className="text-wine" />
        </IconButton>
      </div>

      {/* วันที่แก้ล่าสุด + โฟลเดอร์ */}
      <p className="text-center font-typewriter text-xs text-soft">
        {new Date(info.updatedAt || Date.now()).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
        {currentFolder && ` · ${currentFolder.emoji} ${currentFolder.name}`}
      </p>

      <MemoEditor
        startContent={startContent}
        onChange={(content, plainText) => setMemoData({ content, plainText })}
        uploadOneFile={uploadOneFile}
        isUploading={isUploading}
        autoFocus={isNewMemo}
      />

      <PopupBox isOpen={isFolderBoxOpen} title="ย้ายไปโฟลเดอร์" onClose={() => setIsFolderBoxOpen(false)}>
        <div className="flex flex-col gap-1.5">
          <FolderChoice label="ไม่จัดหมวด" emoji="🗂️" isSelected={info.folderId === null} onClick={() => chooseFolder(null)} />
          {folders.map((folder) => (
            <FolderChoice
              key={folder.id}
              label={folder.name}
              emoji={folder.emoji}
              isSelected={info.folderId === folder.id}
              onClick={() => chooseFolder(folder.id)}
            />
          ))}
          {folders.length === 0 && <p className="text-sm text-soft">ยังไม่มีโฟลเดอร์ สร้างได้ที่หน้ารายการโน๊ต</p>}
        </div>
      </PopupBox>
    </div>
  )
}

/** ตัวเลือกโฟลเดอร์ 1 แถวในกล่องย้ายโฟลเดอร์ */
function FolderChoice({ label, emoji, isSelected, onClick }: { label: string; emoji: string; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left transition ${
        isSelected ? 'border-wine bg-blush' : 'border-line hover:border-pink'
      }`}
    >
      <span aria-hidden="true">{emoji}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {isSelected && <Check size={16} className="text-wine" />}
    </button>
  )
}

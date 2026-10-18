// =====================================================================
// TrashPage : หน้าถังขยะ (/trash)
// รวมของที่ลบจากทุกระบบ (ผ่าน trashActions) กู้คืน หรือ ลบถาวร ได้
// ของจะถูกลบถาวรเองเมื่อครบ 30 วัน
// =====================================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useAllFeatures } from '@/shared/layout/useAllFeatures'
import { PageTitle } from '@/shared/parts/PageTitle'
import { Tabs } from '@/shared/parts/Tabs'
import { RoundButton } from '@/shared/parts/RoundButton'
import { ConfirmBox } from '@/shared/parts/PopupBox'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { LoadingDots } from '@/shared/parts/LoadingDots'
import { useShowMessage } from '@/shared/parts/PopupMessage'
import type { AppFeature, TrashItem } from '../AppFeature'
import { daysLeftInTrash, TRASH_KEEP_DAYS } from './deleteOldTrash'

/** ของในถังขยะ + มาจากระบบไหน */
interface TrashItemWithFeature extends TrashItem {
  feature: AppFeature
}

/** คำถามยืนยันที่เปิดอยู่ */
type QuestionToAsk = { kind: 'delete-one'; item: TrashItemWithFeature } | { kind: 'delete-all' } | null

export function TrashPage() {
  const features = useAllFeatures()
  const showMessage = useShowMessage()
  const [trashItems, setTrashItems] = useState<TrashItemWithFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const [questionToAsk, setQuestionToAsk] = useState<QuestionToAsk>(null)

  const featuresWithTrash = useMemo(() => features.filter((feature) => feature.trashActions), [features])

  /** โหลดของในถังขยะจากทุกระบบ */
  const loadTrash = useCallback(async () => {
    try {
      const itemsOfEachFeature = await Promise.all(
        featuresWithTrash.map(async (feature) =>
          (await feature.trashActions!.getTrashItems()).map((item) => ({ ...item, feature })),
        ),
      )
      const allItems = itemsOfEachFeature
        .flat()
        .filter((item) => daysLeftInTrash(item.deletedAt) > 0) // ซ่อนของที่หมดเวลาแล้ว
        .sort((first, second) => second.deletedAt.localeCompare(first.deletedAt))
      setTrashItems(allItems)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'โหลดถังขยะไม่สำเร็จ', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [featuresWithTrash, showMessage])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  const shownItems = selectedTab === 'all' ? trashItems : trashItems.filter((item) => item.feature.id === selectedTab)

  async function bringBack(item: TrashItemWithFeature) {
    try {
      await item.feature.trashActions!.bringBackFromTrash(item.id)
      showMessage(`กู้คืน "${item.title}" แล้ว`)
      loadTrash()
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'กู้คืนไม่สำเร็จ', 'error')
    }
  }

  async function deleteForever(items: TrashItemWithFeature[]) {
    try {
      for (const item of items) await item.feature.trashActions!.deleteForever(item.id)
      showMessage(items.length === 1 ? 'ลบถาวรแล้ว' : `ลบถาวร ${items.length} รายการแล้ว`)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'ลบไม่สำเร็จ', 'error')
    } finally {
      loadTrash()
    }
  }

  return (
    <>
      <PageTitle
        smallLabel="TRASH"
        title="ถังขยะ."
        underText={`ของที่ลบจะอยู่ที่นี่ ${TRASH_KEEP_DAYS} วัน แล้วหายไปเอง`}
        rightSide={
          shownItems.length > 0 && (
            <RoundButton look="danger" size="small" icon={<Trash2 size={15} />} onClick={() => setQuestionToAsk({ kind: 'delete-all' })}>
              ล้างถังขยะ
            </RoundButton>
          )
        }
      />

      <div className="overflow-hidden rounded-3xl border border-line bg-cream">
        <div className="pt-2">
          <Tabs
            tabList={[
              { id: 'all', name: 'ทั้งหมด', count: trashItems.length },
              ...featuresWithTrash.map((feature) => ({
                id: feature.id,
                name: feature.trashActions!.kindName,
                count: trashItems.filter((item) => item.feature.id === feature.id).length,
              })),
            ]}
            selectedId={selectedTab}
            onSelect={setSelectedTab}
          />
        </div>
        <div className="flex flex-col gap-3 bg-paper p-4">
          {isLoading ? (
            <LoadingDots />
          ) : shownItems.length === 0 ? (
            <EmptyMessage emoji="🧺" title="ถังขยะว่างเปล่า" text="ของที่ลบจะมาอยู่ตรงนี้ กู้คืนได้ภายใน 30 วัน" />
          ) : (
            shownItems.map((item) => {
              const daysLeft = daysLeftInTrash(item.deletedAt)
              return (
                <div key={`${item.feature.id}-${item.id}`} className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line px-4 py-3">
                  <span className="h-10 w-1.5 flex-none rounded-full bg-pink" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-cute text-[15px] text-ink">
                      <span aria-hidden="true">{item.feature.trashActions!.kindEmoji}</span> {item.title}
                    </p>
                    {item.previewText && <p className="truncate text-sm text-soft">{item.previewText}</p>}
                    <p className={`font-typewriter text-xs ${daysLeft <= 3 ? 'text-danger' : 'text-soft'}`}>
                      ลบถาวรในอีก {daysLeft} วัน
                    </p>
                  </div>
                  <RoundButton look="pink" size="small" icon={<RotateCcw size={15} />} onClick={() => bringBack(item)}>
                    <span className="hidden sm:inline">กู้คืน</span>
                  </RoundButton>
                  <RoundButton
                    look="ghost"
                    size="small"
                    aria-label="ลบถาวร"
                    title="ลบถาวร"
                    onClick={() => setQuestionToAsk({ kind: 'delete-one', item })}
                  >
                    <Trash2 size={16} />
                  </RoundButton>
                </div>
              )
            })
          )}
        </div>
      </div>

      <ConfirmBox
        isOpen={questionToAsk !== null}
        title="ลบถาวร?"
        text={
          questionToAsk?.kind === 'delete-one'
            ? `"${questionToAsk.item.title}" จะหายไปเลย กู้คืนไม่ได้อีก (รูป/วิดีโอที่แนบจะถูกลบด้วย)`
            : `ลบทั้งหมด ${shownItems.length} รายการ แบบกู้คืนไม่ได้อีก`
        }
        confirmText="ลบถาวร"
        isDanger
        onConfirm={() => {
          if (questionToAsk?.kind === 'delete-one') deleteForever([questionToAsk.item])
          if (questionToAsk?.kind === 'delete-all') deleteForever(shownItems)
        }}
        onClose={() => setQuestionToAsk(null)}
      />
    </>
  )
}

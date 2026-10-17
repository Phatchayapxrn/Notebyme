// =====================================================================
// Tabs : แถบแท็บแบบแฟ้ม (แบบรูป Tasks / Events / Table)
// ใช้งาน:
//   <Tabs
//     tabList={[{ id: 'all', name: 'ทั้งหมด' }, { id: 'note', name: 'โน๊ต' }]}
//     selectedId={tab}
//     onSelect={setTab}
//   />
// =====================================================================

export interface TabInfo {
  id: string
  name: string
  /** ตัวเลขเล็กๆ ข้างชื่อ (เช่น จำนวนรายการ) */
  count?: number
}

interface TabsProps {
  tabList: TabInfo[]
  selectedId: string
  onSelect: (id: string) => void
}

export function Tabs({ tabList, selectedId, onSelect }: TabsProps) {
  return (
    <div role="tablist" className="hide-scrollbar flex gap-1 overflow-x-auto border-b-[1.5px] border-wine/20 px-2">
      {tabList.map((tab) => {
        const isSelected = tab.id === selectedId
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onSelect(tab.id)}
            className={`-mb-[1.5px] flex flex-none items-center gap-1.5 rounded-t-2xl border-[1.5px] px-5 py-2.5 text-[15px] transition ${
              isSelected
                ? 'border-wine/20 border-b-paper bg-paper text-ink'
                : 'border-transparent text-soft hover:text-ink'
            }`}
          >
            {tab.name}
            {tab.count !== undefined && (
              <span className="rounded-full bg-blush px-2 font-typewriter text-xs text-wine">{tab.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

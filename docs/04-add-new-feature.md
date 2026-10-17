# 04 · วิธีเพิ่มระบบใหม่ (ทีละขั้น)

แอพนี้ออกแบบให้ **เพิ่มระบบใหม่ได้โดยไม่ต้องแก้ของเดิม**
ระบบใหม่จะได้ **เมนู + หน้า + การ์ดในหน้าแรก + ถังขยะ + สำรองข้อมูล** ไปด้วยอัตโนมัติ

ตัวอย่างนี้จะสร้างระบบ **"ลิงก์ที่ชอบ"** (เก็บลิงก์เว็บไว้ดูทีหลัง)

---

## ขั้นที่ 1: สร้างตารางในฐานข้อมูล

สร้างไฟล์ `supabase/sql/003_links.sql` แล้วเอาไปรันใน Supabase SQL Editor

```sql
create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  url         text not null,
  group_id    uuid references public.groups (id) on delete set null,  -- ใช้หมวดร่วมกับระบบอื่นได้
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz                                             -- ใส่ไว้ถ้าอยากให้มีถังขยะ
);

-- ความปลอดภัย: เห็นเฉพาะของตัวเอง (ต้องมีทุกตาราง!)
alter table public.links enable row level security;
create policy "owner only" on public.links
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- อัปเดตสด (ไม่ใส่ก็ได้)
alter table public.links replica identity full;
alter publication supabase_realtime add table public.links;
```

---

## ขั้นที่ 2: สร้างโฟลเดอร์ระบบ

```
src/features/links/
├─ feature.tsx
├─ types.ts
├─ database.ts
└─ pages/LinksPage.tsx
```
> 💡 วิธีที่ง่ายที่สุด: **คัดลอกโฟลเดอร์ `tasks/` ทั้งโฟลเดอร์** แล้วแก้ชื่อ

### `types.ts` : หน้าตาข้อมูล
```ts
// หน้าตาข้อมูลของ "ลิงก์"
export interface SavedLink {
  id: string
  title: string
  url: string
  groupId: string | null
  createdAt: string
}
```

### `database.ts` : ฟังก์ชันอ่าน/เขียน
```ts
import { database, stopIfError, tellListChanged } from '@/shared/database'
import type { SavedLink } from './types'

const TABLE_NAME = 'links'

/** ดึงลิงก์ทั้งหมด (ที่ไม่อยู่ในถังขยะ) */
export async function getAllLinks(): Promise<SavedLink[]> {
  const { data, error } = await database
    .from(TABLE_NAME).select('*').is('deleted_at', null).order('created_at', { ascending: false })
  stopIfError(error)
  return (data ?? []).map((row) => ({
    id: row.id, title: row.title, url: row.url, groupId: row.group_id, createdAt: row.created_at,
  }))
}

/** เพิ่มลิงก์ */
export async function addNewLink(title: string, url: string) {
  const { error } = await database.from(TABLE_NAME).insert({ title, url })
  stopIfError(error)
  tellListChanged(TABLE_NAME) // บอกหน้าจอให้โหลดใหม่
}

/** ย้ายไปถังขยะ / กู้คืน / ลบถาวร / ดึงของในถังขยะ */
export async function moveLinkToTrash(id: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  stopIfError(error); tellListChanged(TABLE_NAME)
}
export async function bringLinkBack(id: string) {
  const { error } = await database.from(TABLE_NAME).update({ deleted_at: null }).eq('id', id)
  stopIfError(error); tellListChanged(TABLE_NAME)
}
export async function deleteLinkForever(id: string) {
  const { error } = await database.from(TABLE_NAME).delete().eq('id', id)
  stopIfError(error); tellListChanged(TABLE_NAME)
}
export async function getLinksInTrash() {
  const { data, error } = await database.from(TABLE_NAME).select('id, title, deleted_at').not('deleted_at', 'is', null)
  stopIfError(error)
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, deletedAt: row.deleted_at }))
}
```

### `pages/LinksPage.tsx` : หน้าจอ
```tsx
import { useState } from 'react'
import { useLiveList } from '@/shared/data/useLiveList'
import { PageTitle } from '@/shared/parts/PageTitle'
import { WindowBox } from '@/shared/parts/WindowBox'
import { RoundButton } from '@/shared/parts/RoundButton'
import { EmptyMessage } from '@/shared/parts/EmptyMessage'
import { addNewLink, getAllLinks, moveLinkToTrash } from '../database'

export function LinksPage() {
  // ดึงรายการ + อัปเดตสดอัตโนมัติ
  const { items: links } = useLiveList({ tableName: 'links', getList: getAllLinks })
  const [url, setUrl] = useState('')

  return (
    <>
      <PageTitle smallLabel="LINKS" title="ลิงก์ที่ชอบ." underText="เก็บไว้ดูทีหลัง" />
      <form
        className="mb-6 flex gap-2"
        onSubmit={(event) => { event.preventDefault(); addNewLink(url, url); setUrl('') }}
      >
        <input className="text-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="วางลิงก์..." />
        <RoundButton look="main" type="submit">เพิ่ม</RoundButton>
      </form>
      {links.length === 0 ? (
        <EmptyMessage emoji="🔗" title="ยังไม่มีลิงก์" />
      ) : (
        <WindowBox title="links.exe" insideClassName="divide-y divide-line">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2 px-4 py-3">
              <a href={link.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-wine underline">{link.title}</a>
              <RoundButton look="ghost" size="small" onClick={() => moveLinkToTrash(link.id)}>ลบ</RoundButton>
            </div>
          ))}
        </WindowBox>
      )}
    </>
  )
}
```

---

## ขั้นที่ 3: กรอกข้อมูลระบบ (`feature.tsx`)

```tsx
import { Link2 } from 'lucide-react'                // เลือกไอคอนได้ที่ https://lucide.dev/icons
import type { AppFeature } from '../AppFeature'
import { LinksPage } from './pages/LinksPage'
import { bringLinkBack, deleteLinkForever, getAllLinks, getLinksInTrash } from './database'

export const linksFeature: AppFeature = {
  id: 'links',                 // ชื่อในโค้ด ห้ามซ้ำ
  menuName: 'ลิงก์',            // ชื่อในเมนู
  menuIcon: Link2,
  mainPath: '/links',
  menuOrder: 4,                // อยู่หลัง "งาน" (3) ก่อน "ถังขยะ" (90)
  pages: [{ path: '/links', element: <LinksPage /> }],

  // ---- ส่วนที่ไม่ใส่ก็ได้ ----
  trashActions: {              // ให้ของที่ลบไปโผล่ในหน้าถังขยะ + ลบเองเมื่อครบ 30 วัน
    kindName: 'ลิงก์',
    kindEmoji: '🔗',
    getTrashItems: getLinksInTrash,
    bringBackFromTrash: bringLinkBack,
    deleteForever: deleteLinkForever,
  },
  getBackupData: getAllLinks,  // ให้ปุ่ม "สำรองข้อมูล" รวมลิงก์ไปด้วย
  // homeCard: LinksHomeCard,  // การ์ดในหน้าแรก (สร้าง component เพิ่มเอง)
  // sideCard: ...,            // กล่องในแถบขวาจอคอม
}
```

---

## ขั้นที่ 4: ลงทะเบียน (บรรทัดเดียว!)

เปิด `src/features/allFeatures.ts`
```ts
import { linksFeature } from './links/feature'   // ← เพิ่ม

export const allFeatures: AppFeature[] = [
  homeFeature,
  notesFeature,
  tasksFeature,
  linksFeature,                                   // ← เพิ่ม
  trashFeature,
  settingsFeature,
  loginFeature,
]
```

## ขั้นที่ 5: ลองดู
รัน `npm run dev` → เมนู "ลิงก์" จะโผล่ทั้งเมนูซ้าย (คอม) และเมนูล่าง (มือถือ) 🎉

---

## ✅ เช็คลิสต์ระบบใหม่

- [ ] ตารางใหม่มี `user_id` + เปิด RLS + policy "owner only" (**สำคัญมาก** ไม่งั้นคนอื่นเห็นข้อมูล)
- [ ] ถ้าอยากมีถังขยะ: มีคอลัมน์ `deleted_at` + ใส่ `trashActions`
- [ ] ฟังก์ชันที่เพิ่ม/แก้/ลบ เรียก `tellListChanged('ชื่อตาราง')` ทุกครั้ง
- [ ] ตั้งชื่อตามกฎใน [07-word-list.md](07-word-list.md) (คำง่าย + คอมเมนต์ไทย)
- [ ] เขียน `README.md` ในโฟลเดอร์ระบบ บอกว่าแต่ละไฟล์ทำอะไร

## ใช้ของกลางได้เลย (ไม่ต้องเขียนใหม่)

| อยากได้ | ใช้ |
|---|---|
| ใส่หมวดหมู่ | คอลัมน์ `group_id` + `<GroupPicker />` + `useGroups()` |
| แนบรูป/วิดีโอ | `useUploadFile({ belongsToType: 'links', belongsToId: id })` (ดู [05](05-pictures-and-videos.md)) |
| บันทึกอัตโนมัติ | `useAutoSave(...)` (ดู [06](06-saving-and-sync.md)) |
| ปุ่ม กล่อง แท็บ | `src/shared/parts/` (ดู [02](02-design-system.md)) |
| วันที่ภาษาไทย | `src/shared/dateTools.ts` |

> ⚠️ ถ้าระบบใหม่แนบไฟล์ ตอน `deleteForever` อย่าลืมเรียก `deleteAllFilesOf({ belongsToType, belongsToId })` ก่อนลบแถว
> (ดูตัวอย่างใน `src/features/notes/database.ts` ฟังก์ชัน `deleteNoteForever`)

## ไม่อยากให้โชว์ในเมนู?
ใส่ `showInMenu: false` (หน้ายังเข้าได้ผ่านลิงก์)

## ลบระบบออก
ลบบรรทัดใน `allFeatures.ts` → เมนูและหน้าหายไป (ข้อมูลในฐานข้อมูลยังอยู่)

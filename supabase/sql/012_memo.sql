-- =====================================================================
-- 012_memo.sql : ตารางของระบบ "โน๊ต" (แบบโน๊ตไอโฟน: โฟลเดอร์ + ปักหมุด + จัดรูปแบบข้อความ)
-- วิธีใช้: รันหลัง 004 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
-- ระบบนี้ล็อกตั้งแต่เริ่ม (เหมือนระบบอื่น): ยังไม่มียศ = มีแค่แอดมินที่เห็น
-- แอดมินไปติ๊กยศให้ระบบ "โน๊ต" ได้ที่ หน้าตั้งค่า → ยศ
-- =====================================================================

-- ล็อกระบบ memo (ไม่ทับค่าที่แอดมินตั้งไว้แล้ว)
insert into public.feature_rules (feature_id, is_locked) values ('memo', true)
on conflict (feature_id) do nothing;

-- ---------------------------------------------------------------------
-- โฟลเดอร์ของโน๊ต
-- ---------------------------------------------------------------------
create table if not exists public.memo_folders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null default '',
  emoji         text not null default '📁',
  order_number  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table  public.memo_folders              is 'โฟลเดอร์ของโน๊ต (ระบบโน๊ตแบบไอโฟน)';
comment on column public.memo_folders.order_number is 'ลำดับการแสดง (เลขน้อยอยู่ก่อน)';

-- ---------------------------------------------------------------------
-- โน๊ต (1 แถว = 1 โน๊ต)
-- ---------------------------------------------------------------------
create table if not exists public.memos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  folder_id   uuid references public.memo_folders (id) on delete set null,
  content     jsonb,
  plain_text  text not null default '',
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.memos            is 'โน๊ต (ระบบโน๊ตแบบไอโฟน)';
comment on column public.memos.folder_id  is 'อยู่โฟลเดอร์ไหน (ว่าง = ไม่จัดหมวด)';
comment on column public.memos.content    is 'เนื้อหาแบบ JSON ของ TipTap (ตัวหนา ตาราง รูป ฯลฯ)';
comment on column public.memos.plain_text is 'ข้อความล้วน (บรรทัดแรก = ชื่อโน๊ต) ใช้ค้นหาและโชว์ตัวอย่าง';
comment on column public.memos.is_pinned  is 'ปักหมุดไว้บนสุด';
comment on column public.memos.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

create index if not exists memos_user_index on public.memos (user_id, deleted_at, updated_at desc);

-- ---------------------------------------------------------------------
-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ memo
-- ---------------------------------------------------------------------
alter table public.memo_folders enable row level security;
alter table public.memos        enable row level security;

drop policy if exists "owner only" on public.memo_folders;
create policy "owner only" on public.memo_folders
  for all using (user_id = auth.uid() and (select public.can_use_feature('memo')))
  with check (user_id = auth.uid() and (select public.can_use_feature('memo')));

drop policy if exists "owner only" on public.memos;
create policy "owner only" on public.memos
  for all using (user_id = auth.uid() and (select public.can_use_feature('memo')))
  with check (user_id = auth.uid() and (select public.can_use_feature('memo')));

-- ---------------------------------------------------------------------
-- อัปเดตสดข้ามเครื่อง
-- ---------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.memo_folders;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.memos;
exception when duplicate_object then null;
end $$;

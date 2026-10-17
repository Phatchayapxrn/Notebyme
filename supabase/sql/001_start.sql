-- =====================================================================
-- 001_start.sql : สร้างตารางหลัก (หมวดหมู่ / โน๊ต / สิ่งที่ต้องทำ)
-- วิธีใช้: Supabase → SQL Editor → New query → วางทั้งไฟล์ → กด Run
-- รันซ้ำได้ ไม่พัง (มี if not exists)
-- =====================================================================

-- ---------------------------------------------------------------------
-- ฟังก์ชันช่วย: อัปเดตเวลา updated_at ให้อัตโนมัติทุกครั้งที่แก้ไขแถว
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- ตาราง groups : หมวดหมู่ (ใช้ร่วมกันทั้งโน๊ตและสิ่งที่ต้องทำ)
-- =====================================================================
create table if not exists public.groups (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null,
  emoji         text not null default '✨',
  color         text not null default '#F2BFC8',
  cover_picture text not null default 'pattern:hearts',
  order_number  integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on table  public.groups               is 'หมวดหมู่ของผู้ใช้';
comment on column public.groups.user_id       is 'เจ้าของหมวดหมู่';
comment on column public.groups.name          is 'ชื่อหมวด';
comment on column public.groups.emoji         is 'อีโมจิหน้าชื่อหมวด';
comment on column public.groups.color         is 'สีประจำหมวด (รหัสสี เช่น #F2BFC8)';
comment on column public.groups.cover_picture is 'ภาพปกการ์ด: "pattern:ชื่อลาย" หรือ path ไฟล์ที่อัปโหลด';
comment on column public.groups.order_number  is 'ลำดับการแสดง (เลขน้อยอยู่ก่อน)';

-- =====================================================================
-- ตาราง notes : โน๊ต / ไอเดีย
-- =====================================================================
create table if not exists public.notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null default '',
  content       jsonb,
  plain_text    text not null default '',
  first_picture text,
  group_id      uuid references public.groups (id) on delete set null,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table  public.notes               is 'โน๊ต/ไอเดีย';
comment on column public.notes.title         is 'หัวข้อ';
comment on column public.notes.content       is 'เนื้อหา (รูปแบบ JSON ของ TipTap editor มีรูป/วิดีโออยู่ในนี้)';
comment on column public.notes.plain_text    is 'เนื้อหาแบบตัวหนังสือล้วน ใช้ค้นหาและโชว์ตัวอย่าง';
comment on column public.notes.first_picture is 'path รูปแรกในโน๊ต ใช้ทำรูปย่อ';
comment on column public.notes.group_id      is 'อยู่หมวดไหน (ว่าง = ไม่มีหมวด; ถ้าลบหมวด จะกลายเป็นว่าง)';
comment on column public.notes.is_pinned     is 'ปักหมุดไว้บนสุดหรือไม่';
comment on column public.notes.deleted_at    is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- =====================================================================
-- ตาราง tasks : สิ่งที่ต้องทำ
-- =====================================================================
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null,
  is_done     boolean not null default false,
  importance  text not null default 'medium' check (importance in ('low', 'medium', 'high')),
  due_date    date,
  group_id    uuid references public.groups (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  done_at     timestamptz,
  deleted_at  timestamptz
);

comment on table  public.tasks            is 'สิ่งที่ต้องทำ';
comment on column public.tasks.text       is 'ข้อความงาน';
comment on column public.tasks.is_done    is 'ทำเสร็จแล้วหรือยัง';
comment on column public.tasks.importance is 'ความสำคัญ: low = ต่ำ, medium = กลาง, high = สูง';
comment on column public.tasks.due_date   is 'วันที่ต้องเสร็จ (ว่างได้)';
comment on column public.tasks.done_at    is 'เวลาที่ติ๊กเสร็จ';
comment on column public.tasks.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- ---------------------------------------------------------------------
-- ตัวช่วยให้ค้นหาเร็ว (index)
-- ---------------------------------------------------------------------
create index if not exists groups_user_index on public.groups (user_id, order_number);
create index if not exists notes_user_index  on public.notes  (user_id, deleted_at, updated_at desc);
create index if not exists tasks_user_index  on public.tasks  (user_id, deleted_at, is_done);

-- ---------------------------------------------------------------------
-- ให้ updated_at อัปเดตเอง
-- ---------------------------------------------------------------------
drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- ความปลอดภัย (RLS): แต่ละคนเห็นและแก้ได้เฉพาะข้อมูลของตัวเอง
-- ---------------------------------------------------------------------
alter table public.groups enable row level security;
alter table public.notes  enable row level security;
alter table public.tasks  enable row level security;

drop policy if exists "owner only" on public.groups;
create policy "owner only" on public.groups
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "owner only" on public.notes;
create policy "owner only" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "owner only" on public.tasks;
create policy "owner only" on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- อัปเดตสด (Realtime): แก้ในเครื่องหนึ่ง อีกเครื่องเห็นทันที
-- ---------------------------------------------------------------------
alter table public.groups replica identity full;
alter table public.notes  replica identity full;
alter table public.tasks  replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table public.groups; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.notes;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.tasks;  exception when duplicate_object then null; end;
end;
$$;

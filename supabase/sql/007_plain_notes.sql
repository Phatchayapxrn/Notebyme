-- =====================================================================
-- 007_plain_notes.sql : ตารางของระบบ "โน๊ตทั่วไป" (พิมพ์ข้อความธรรมดา เร็วๆ)
-- วิธีใช้: รันหลัง 004 และ 005 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
-- =====================================================================

create table if not exists public.plain_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null default '',
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.plain_notes            is 'โน๊ตทั่วไป (ข้อความธรรมดา 1 แถว = 1 โน๊ต)';
comment on column public.plain_notes.text       is 'ข้อความ (บรรทัดแรก = ชื่อโน๊ต)';
comment on column public.plain_notes.is_pinned  is 'ปักหมุดไว้บนสุด';
comment on column public.plain_notes.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ plain_notes (ยศ)
alter table public.plain_notes enable row level security;

drop policy if exists "owner only" on public.plain_notes;
create policy "owner only" on public.plain_notes
  for all using (user_id = auth.uid() and (select public.can_use_feature('plain_notes')))
  with check (user_id = auth.uid() and (select public.can_use_feature('plain_notes')));

do $$
begin
  alter publication supabase_realtime add table public.plain_notes;
exception when duplicate_object then null;
end $$;

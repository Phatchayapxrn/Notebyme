-- =====================================================================
-- 002_files.sql : ที่เก็บไฟล์รูป/วิดีโอ
-- วิธีใช้: รันหลังจาก 001_start.sql (SQL Editor → วาง → Run)
-- =====================================================================

-- ---------------------------------------------------------------------
-- ถังเก็บไฟล์ชื่อ "user-files" แบบส่วนตัว (คนอื่นเปิดไม่ได้)
-- จำกัดขนาดไฟล์ละ 50MB (เพดานของ Supabase แบบฟรี)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('user-files', 'user-files', false, 52428800)
on conflict (id) do nothing;

-- ไฟล์เก็บที่ path: {user_id}/{ประเภท}/{id เจ้าของ}/{ชื่อไฟล์}
-- กฎ: เข้าถึงได้เฉพาะไฟล์ที่อยู่ในโฟลเดอร์ชื่อ user_id ของตัวเอง
drop policy if exists "user-files: read own"   on storage.objects;
drop policy if exists "user-files: add own"    on storage.objects;
drop policy if exists "user-files: change own" on storage.objects;
drop policy if exists "user-files: delete own" on storage.objects;

create policy "user-files: read own" on storage.objects for select
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user-files: add own" on storage.objects for insert
  with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user-files: change own" on storage.objects for update
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user-files: delete own" on storage.objects for delete
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- ตาราง files : จดว่าไฟล์ไหนเป็นของอะไร (ใช้ตอนลบ จะได้ลบไฟล์ตามไปด้วย)
-- ระบบใหม่ในอนาคตใช้ตารางนี้ได้เลย แค่ตั้ง belongs_to_type เป็นชื่อระบบตัวเอง
-- =====================================================================
create table if not exists public.files (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  belongs_to_type text not null,
  belongs_to_id   uuid not null,
  file_path       text not null unique,
  file_type       text not null,
  file_size       bigint not null default 0,
  width           integer,
  height          integer,
  created_at      timestamptz not null default now()
);

comment on table  public.files                 is 'ข้อมูลไฟล์ที่อัปโหลด (ตัวไฟล์จริงอยู่ใน Storage)';
comment on column public.files.belongs_to_type is 'ไฟล์นี้เป็นของอะไร เช่น note, group';
comment on column public.files.belongs_to_id   is 'id ของสิ่งที่เป็นเจ้าของไฟล์';
comment on column public.files.file_path       is 'ตำแหน่งไฟล์ใน Storage (ถัง user-files)';
comment on column public.files.file_type       is 'ชนิดไฟล์ เช่น image/jpeg, video/mp4';
comment on column public.files.file_size       is 'ขนาดไฟล์ (byte)';

create index if not exists files_owner_index on public.files (user_id, belongs_to_type, belongs_to_id);

alter table public.files enable row level security;

drop policy if exists "owner only" on public.files;
create policy "owner only" on public.files
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

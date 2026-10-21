-- =====================================================================
-- 010_chat.sql : ตารางของระบบ "แชท" (เก็บข้อความส่วนตัวแบบ Google Chat คุยกับตัวเอง)
-- วิธีใช้: รันหลัง 002, 004 และ 005 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
--   chat_rooms    = ห้อง / หัวข้อ (เช่น "ไอเดียร้าน", "ของที่ต้องซื้อ")
--   chat_messages = ข้อความในห้อง (แนบรูป/วิดีโอได้ → เก็บ path ไฟล์ใน attachments)
-- ไฟล์จริงอยู่ใน Storage ถัง user-files (ดู 002_files.sql) ตัวไฟล์ไม่ผูกกับยศ ผูกแค่กับเจ้าของ
-- =====================================================================

create table if not exists public.chat_rooms (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.chat_rooms            is 'ห้องแชท / หัวข้อ';
comment on column public.chat_rooms.name       is 'ชื่อห้อง';
comment on column public.chat_rooms.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

create table if not exists public.chat_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  room_id      uuid not null references public.chat_rooms (id) on delete cascade,
  text         text not null default '',
  attachments  jsonb not null default '[]'::jsonb,
  is_pinned    boolean not null default false,
  edited_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

comment on table  public.chat_messages             is 'ข้อความในห้องแชท';
comment on column public.chat_messages.attachments is 'ไฟล์แนบ เช่น [{"path":"...","type":"image/jpeg","width":800,"height":600}]';
comment on column public.chat_messages.is_pinned   is 'ปักหมุดข้อความ';
comment on column public.chat_messages.edited_at   is 'เวลาที่แก้ข้อความล่าสุด (ว่าง = ไม่เคยแก้)';

create index if not exists chat_messages_room_index on public.chat_messages (user_id, room_id, created_at);

-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ chat (ยศ)
alter table public.chat_rooms    enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "owner only" on public.chat_rooms;
create policy "owner only" on public.chat_rooms
  for all using (user_id = auth.uid() and (select public.can_use_feature('chat')))
  with check (user_id = auth.uid() and (select public.can_use_feature('chat')));

drop policy if exists "owner only" on public.chat_messages;
create policy "owner only" on public.chat_messages
  for all using (user_id = auth.uid() and (select public.can_use_feature('chat')))
  with check (user_id = auth.uid() and (select public.can_use_feature('chat')));

do $$
begin
  begin alter publication supabase_realtime add table public.chat_rooms;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; end;
end;
$$;

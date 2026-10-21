-- =====================================================================
-- 011_calendar.sql : ตารางของระบบ "ปฏิทิน" (จดตาราง/นัด แบบ Google Calendar)
-- วิธีใช้: รันหลัง 004 และ 005 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
-- 1 แถว = 1 กิจกรรม (วันเดียว) ถ้าตั้งให้ซ้ำ จะเก็บแค่แถวเดียว แล้วหน้าเว็บคำนวณวันที่ซ้ำเอง
-- =====================================================================

create table if not exists public.calendar_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title           text not null default '',
  note            text not null default '',
  event_date      date not null,
  is_all_day      boolean not null default true,
  start_time      text check (start_time is null or start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  end_time        text check (end_time is null or end_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  color           text not null default 'blue',
  repeat_kind     text not null default 'none' check (repeat_kind in ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  repeat_until    date,
  remind_minutes  integer check (remind_minutes is null or remind_minutes >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

comment on table  public.calendar_events                is 'กิจกรรมในปฏิทิน';
comment on column public.calendar_events.event_date     is 'วันที่เริ่ม (กิจกรรมที่ซ้ำ = วันแรก)';
comment on column public.calendar_events.is_all_day     is 'true = ทั้งวัน (ไม่มีเวลา)';
comment on column public.calendar_events.start_time     is 'เวลาเริ่ม รูปแบบ HH:MM (ว่างได้ถ้าทั้งวัน)';
comment on column public.calendar_events.color          is 'สีของกิจกรรม เช่น blue, orange, green, pink, violet, yellow';
comment on column public.calendar_events.repeat_kind    is 'none = ไม่ซ้ำ / daily / weekly / monthly / yearly';
comment on column public.calendar_events.repeat_until   is 'ซ้ำถึงวันที่ (ว่าง = ซ้ำไม่มีสิ้นสุด)';
comment on column public.calendar_events.remind_minutes is 'เตือนก่อนเริ่มกี่นาที (ว่าง = ไม่เตือน)';
comment on column public.calendar_events.deleted_at     is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ calendar (ยศ)
alter table public.calendar_events enable row level security;

drop policy if exists "owner only" on public.calendar_events;
create policy "owner only" on public.calendar_events
  for all using (user_id = auth.uid() and (select public.can_use_feature('calendar')))
  with check (user_id = auth.uid() and (select public.can_use_feature('calendar')));

do $$
begin
  alter publication supabase_realtime add table public.calendar_events;
exception when duplicate_object then null;
end $$;

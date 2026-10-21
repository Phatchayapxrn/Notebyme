-- =====================================================================
-- 006_mails.sql : ตารางของระบบ "เก็บเมล" (เมล + รหัสผ่าน แยกเป็นชุดๆ)
-- วิธีใช้: รันหลัง 004 และ 005 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
-- 1 แถว = 1 ชุด  ในชุดมีหลาย "ช่องข้อมูล" (เช่น อีเมล, รหัสผ่าน, ...) เก็บเป็น json
-- ⚠️ เก็บเป็นข้อความธรรมดา (ไม่เข้ารหัส) ป้องกันด้วย RLS + ยศเท่านั้น
--    ใครเข้า Supabase Dashboard ได้ ก็เปิดอ่านตารางนี้ได้
-- =====================================================================

create table if not exists public.mail_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null default '',
  fields        jsonb not null default '[]'::jsonb,
  order_number  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table  public.mail_sets              is 'ชุดเมล (1 แถว = 1 ชุด)';
comment on column public.mail_sets.title        is 'ชื่อชุด (ว่างได้)';
comment on column public.mail_sets.fields       is 'ช่องข้อมูลในชุด เช่น [{"label":"อีเมล","value":"a@b.com"}, ...]';
comment on column public.mail_sets.order_number is 'ลำดับการแสดง (เลขน้อยอยู่ก่อน)';
comment on column public.mail_sets.deleted_at   is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ mails (ยศ)
alter table public.mail_sets enable row level security;

drop policy if exists "owner only" on public.mail_sets;
create policy "owner only" on public.mail_sets
  for all using (user_id = auth.uid() and (select public.can_use_feature('mails')))
  with check (user_id = auth.uid() and (select public.can_use_feature('mails')));

-- ให้หน้าเว็บอัปเดตสดข้ามเครื่องได้ (Realtime)
do $$
begin
  alter publication supabase_realtime add table public.mail_sets;
exception when duplicate_object then null;
end $$;

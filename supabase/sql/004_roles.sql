-- =====================================================================
-- 004_roles.sql : ยศ (role) + แอดมิน + ล็อกระบบให้เห็นเฉพาะบางยศ
-- วิธีใช้: รันหลังจาก 001 - 003 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
-- ทำงานยังไง:
--   - แอดมิน (ตาราง app_admins) เห็นทุกระบบเสมอ และตั้งค่ายศได้ในหน้าตั้งค่า
--   - แอดมินสร้าง "ยศ" แล้วใส่อีเมลคนลงในยศ
--   - แต่ละระบบ ตั้งได้ว่า "ทุกคนเห็น" หรือ "เฉพาะยศที่เลือก" (ตาราง feature_rules)
--   - คนทั่วไปอ่านตารางยศไม่ได้เลย → ไม่เห็นว่าตัวเองมียศอะไร
--     แอพถามได้แค่ "ฉันเห็นระบบไหนไม่ได้บ้าง" ผ่านฟังก์ชัน get_my_access()
--   - ข้อมูลของแต่ละคนยังแยกกันเหมือนเดิม (ยศ = สิทธิ์เปิดระบบ ไม่ได้แชร์ข้อมูล)
--
-- ⚠️ หลังรันไฟล์นี้ ต้องตั้งตัวเองเป็นแอดมิน (ดูส่วนท้ายสุดของไฟล์)
-- =====================================================================

-- =====================================================================
-- ตาราง app_admins : รายชื่ออีเมลแอดมิน
-- =====================================================================
create table if not exists public.app_admins (
  email       text primary key check (email = lower(email)),
  created_at  timestamptz not null default now()
);
comment on table public.app_admins is 'อีเมลของแอดมิน (เห็นทุกระบบ + ตั้งค่ายศได้)';

-- =====================================================================
-- ตาราง roles : ยศ
-- =====================================================================
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);
comment on table  public.roles      is 'ยศ (เช่น ทีมร้าน, เพื่อนสนิท)';
comment on column public.roles.name is 'ชื่อยศ (คนที่ได้ยศจะไม่เห็นชื่อนี้)';

-- =====================================================================
-- ตาราง role_members : ใครอยู่ยศไหน (ใช้อีเมล 1 คนอยู่ได้หลายยศ)
-- =====================================================================
create table if not exists public.role_members (
  role_id     uuid not null references public.roles (id) on delete cascade,
  email       text not null check (email = lower(email)),
  created_at  timestamptz not null default now(),
  primary key (role_id, email)
);
comment on table  public.role_members       is 'คนในแต่ละยศ';
comment on column public.role_members.email is 'อีเมลที่ใช้ล็อกอิน (ตัวพิมพ์เล็ก)';

-- =====================================================================
-- ตาราง feature_rules : ระบบไหนล็อกไว้ และยศไหนเห็นได้
-- ระบบที่ไม่มีแถวในตารางนี้ = ทุกคนเห็น
-- =====================================================================
create table if not exists public.feature_rules (
  feature_id        text primary key,
  is_locked         boolean not null default false,
  allowed_role_ids  uuid[] not null default '{}',
  updated_at        timestamptz not null default now()
);
comment on table  public.feature_rules                  is 'กฎการมองเห็นของแต่ละระบบ';
comment on column public.feature_rules.feature_id       is 'id ของระบบ ตรงกับ id ใน feature.tsx เช่น shop, future, notes';
comment on column public.feature_rules.is_locked        is 'true = เห็นเฉพาะยศที่เลือก / false = ทุกคนเห็น';
comment on column public.feature_rules.allowed_role_ids is 'ยศที่เห็นระบบนี้ได้ (ใช้เมื่อ is_locked = true)';

-- เริ่มต้น: "ถึงอนาคต" และ "ร้าน" เห็นเฉพาะยศที่เลือก (ยังไม่มียศ = มีแค่แอดมินที่เห็น)
insert into public.feature_rules (feature_id, is_locked) values ('future', true), ('shop', true)
on conflict (feature_id) do nothing;

-- =====================================================================
-- ฟังก์ชันช่วย
-- (security definer = ทำงานด้วยสิทธิ์เจ้าของฐานข้อมูล จึงอ่านตารางยศได้ แม้คนทั่วไปอ่านตรงๆ ไม่ได้)
-- =====================================================================

-- อีเมลของคนที่ล็อกอินอยู่ (ตัวพิมพ์เล็ก)
create or replace function public.my_email()
returns text
language sql stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- ฉันเป็นแอดมินไหม
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.app_admins where email = public.my_email())
$$;

-- ฉันใช้ระบบนี้ได้ไหม
create or replace function public.can_use_feature(wanted_feature text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin()
    or not exists (select 1 from public.feature_rules where feature_id = wanted_feature and is_locked)
    or exists (
      select 1
      from public.feature_rules as rule
      join public.role_members as member on member.role_id = any (rule.allowed_role_ids)
      where rule.feature_id = wanted_feature and rule.is_locked and member.email = public.my_email()
    )
$$;

-- สิ่งที่แอพถามได้: ฉันเป็นแอดมินไหม + ระบบไหนที่ฉันเห็นไม่ได้ (ไม่บอกชื่อยศ)
create or replace function public.get_my_access()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'is_admin', public.is_admin(),
    'hidden_features', coalesce(
      (select json_agg(feature_id) from public.feature_rules where is_locked and not public.can_use_feature(feature_id)),
      '[]'::json
    )
  )
$$;

-- ---------------------------------------------------------------------
-- ความปลอดภัย: ตารางยศ / แอดมิน / กฎ อ่านและแก้ได้เฉพาะแอดมิน
-- ---------------------------------------------------------------------
alter table public.app_admins    enable row level security;
alter table public.roles         enable row level security;
alter table public.role_members  enable row level security;
alter table public.feature_rules enable row level security;

drop policy if exists "admin only" on public.app_admins;
create policy "admin only" on public.app_admins
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin only" on public.roles;
create policy "admin only" on public.roles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin only" on public.role_members;
create policy "admin only" on public.role_members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin only" on public.feature_rules;
create policy "admin only" on public.feature_rules
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- ล็อกในฐานข้อมูลด้วย (ไม่ใช่แค่ซ่อนเมนู): ระบบที่ไม่มีสิทธิ์ อ่าน/เขียนข้อมูลไม่ได้
-- เปลี่ยนกฎ "owner only" ของแต่ละตาราง ให้เช็คสิทธิ์ระบบเพิ่ม
-- ((select ...) ครอบไว้ เพื่อให้เช็คครั้งเดียวต่อคำสั่ง ไม่ใช่ทุกแถว)
-- ---------------------------------------------------------------------
drop policy if exists "owner only" on public.notes;
create policy "owner only" on public.notes
  for all using (user_id = auth.uid() and (select public.can_use_feature('notes')))
  with check (user_id = auth.uid() and (select public.can_use_feature('notes')));

drop policy if exists "owner only" on public.tasks;
create policy "owner only" on public.tasks
  for all using (user_id = auth.uid() and (select public.can_use_feature('tasks')))
  with check (user_id = auth.uid() and (select public.can_use_feature('tasks')));

drop policy if exists "owner only" on public.future_messages;
create policy "owner only" on public.future_messages
  for all using (user_id = auth.uid() and (select public.can_use_feature('future')))
  with check (user_id = auth.uid() and (select public.can_use_feature('future')));

drop policy if exists "owner only" on public.shop_messages;
create policy "owner only" on public.shop_messages
  for all using (user_id = auth.uid() and (select public.can_use_feature('shop')))
  with check (user_id = auth.uid() and (select public.can_use_feature('shop')));

drop policy if exists "owner only" on public.shop_products;
create policy "owner only" on public.shop_products
  for all using (user_id = auth.uid() and (select public.can_use_feature('shop')))
  with check (user_id = auth.uid() and (select public.can_use_feature('shop')));

drop policy if exists "owner only" on public.shop_orders;
create policy "owner only" on public.shop_orders
  for all using (user_id = auth.uid() and (select public.can_use_feature('shop')))
  with check (user_id = auth.uid() and (select public.can_use_feature('shop')));

-- =====================================================================
-- ⚠️ ตั้งตัวเองเป็นแอดมิน (ทำครั้งแรกครั้งเดียว)
-- 1) ลบเครื่องหมาย -- หน้าบรรทัด insert ด้านล่าง
-- 2) เปลี่ยน you@example.com เป็นอีเมลที่ใช้ล็อกอินเว็บนี้
-- 3) กด Run (เฉพาะบรรทัดนี้ หรือทั้งไฟล์ก็ได้)
-- แอดมินคนต่อไป: เพิ่มด้วยคำสั่งเดียวกัน
-- =====================================================================
-- insert into public.app_admins (email) values (lower('you@example.com')) on conflict do nothing;
-- =====================================================================
-- 013_shop_captions.sql : ตารางแคปชั่นโพสต์ของร้าน (แท็บ "แคปชั่น" ในหน้าร้าน)
-- วิธีใช้: รันหลัง 004 และ 003 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
-- สิทธิ์: ใช้สิทธิ์เดียวกับระบบร้าน (shop)
-- =====================================================================

create table if not exists public.shop_captions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null default '',
  post_date   date,
  post_time   time,
  status      text not null default 'draft' check (status in ('draft', 'ready', 'posted')),
  platforms   text[] not null default '{}',
  remind      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.shop_captions            is 'แคปชั่นสำหรับโพสต์ของร้าน (1 แถว = 1 แคปชั่น)';
comment on column public.shop_captions.text       is 'ข้อความแคปชั่น';
comment on column public.shop_captions.post_date  is 'วันที่จะโพสต์ (ว่าง = อยู่ในคลังสำรอง ยังไม่กำหนดวัน)';
comment on column public.shop_captions.post_time  is 'เวลาที่จะโพสต์ (ว่างได้)';
comment on column public.shop_captions.status     is 'draft = ร่าง, ready = พร้อมโพสต์, posted = โพสต์แล้ว';
comment on column public.shop_captions.platforms  is 'แพลตฟอร์มที่จะโพสต์ เช่น {fb,ig,tiktok,line}';
comment on column public.shop_captions.remind     is 'true = เตือนตอนถึงเวลาโพสต์';
comment on column public.shop_captions.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

create index if not exists shop_captions_user_index on public.shop_captions (user_id, deleted_at, post_date);

-- ความปลอดภัย: เห็น/แก้ได้เฉพาะเจ้าของ และต้องมีสิทธิ์ระบบ shop
alter table public.shop_captions enable row level security;

drop policy if exists "owner only" on public.shop_captions;
create policy "owner only" on public.shop_captions
  for all using (user_id = auth.uid() and (select public.can_use_feature('shop')))
  with check (user_id = auth.uid() and (select public.can_use_feature('shop')));

-- ให้ updated_at อัปเดตเอง (ฟังก์ชันมาจาก 001_start.sql)
drop trigger if exists shop_captions_set_updated_at on public.shop_captions;
create trigger shop_captions_set_updated_at
  before update on public.shop_captions
  for each row execute function public.set_updated_at();

-- อัปเดตสดข้ามเครื่อง
do $$
begin
  alter publication supabase_realtime add table public.shop_captions;
exception when duplicate_object then null;
end $$;

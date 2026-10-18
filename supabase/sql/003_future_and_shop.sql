-- =====================================================================
-- 003_future_and_shop.sql : ตารางของ "ข้อความถึงตัวเองในอนาคต" และ "ร้านค้า"
-- วิธีใช้: รันหลังจาก 001 และ 002 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง (มี if not exists)
-- =====================================================================

-- =====================================================================
-- ตาราง future_messages : ข้อความถึงตัวเองในอนาคต
-- =====================================================================
create table if not exists public.future_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null,
  show_date   date not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.future_messages            is 'ข้อความที่เขียนถึงตัวเองในอนาคต';
comment on column public.future_messages.text       is 'ข้อความ';
comment on column public.future_messages.show_date  is 'วันที่จะเปิดให้อ่าน (ขึ้นโชว์ในหน้าแรก)';
comment on column public.future_messages.is_read    is 'อ่านแล้วหรือยัง (อ่านแล้วจะไม่ขึ้นในหน้าแรกอีก)';
comment on column public.future_messages.deleted_at is 'เวลาที่ย้ายไปถังขยะ (ว่าง = ยังไม่ถูกลบ)';

-- =====================================================================
-- ตาราง shop_messages : ชุดข้อความของร้าน (วางข้อความไว้ กดคัดลอกไปใช้ได้)
-- =====================================================================
create table if not exists public.shop_messages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null default '',
  text          text not null default '',
  order_number  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table  public.shop_messages              is 'ชุดข้อความของร้าน (1 แถว = 1 ชุดข้อความ)';
comment on column public.shop_messages.title        is 'ชื่อชุดข้อความ (ว่างได้)';
comment on column public.shop_messages.text         is 'ข้อความทั้งชุด';
comment on column public.shop_messages.order_number is 'ลำดับการแสดง (เลขน้อยอยู่ก่อน)';

-- =====================================================================
-- ตาราง shop_products : สินค้าในร้าน
-- =====================================================================
create table if not exists public.shop_products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  price       numeric(12, 2) not null default 0,
  stock       integer not null default 0,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table  public.shop_products       is 'สินค้าในร้าน';
comment on column public.shop_products.name  is 'ชื่อสินค้า';
comment on column public.shop_products.price is 'ราคาขาย (บาท)';
comment on column public.shop_products.stock is 'จำนวนที่เหลือในสต็อก';
comment on column public.shop_products.note  is 'หมายเหตุ เช่น สี / ไซซ์';

-- =====================================================================
-- ตาราง shop_orders : ออเดอร์ของลูกค้า
-- =====================================================================
create table if not exists public.shop_orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  customer_name  text not null default '',
  detail         text not null default '',
  total_price    numeric(12, 2) not null default 0,
  status         text not null default 'waiting' check (status in ('waiting', 'paid', 'sent')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

comment on table  public.shop_orders               is 'ออเดอร์ของลูกค้า';
comment on column public.shop_orders.customer_name is 'ชื่อลูกค้า';
comment on column public.shop_orders.detail        is 'รายละเอียด เช่น สินค้าที่สั่ง / ที่อยู่';
comment on column public.shop_orders.total_price   is 'ยอดรวม (บาท)';
comment on column public.shop_orders.status        is 'สถานะ: waiting = รอโอน, paid = โอนแล้ว รอส่ง, sent = ส่งแล้ว';

-- ---------------------------------------------------------------------
-- ตัวช่วยให้ค้นหาเร็ว (index)
-- ---------------------------------------------------------------------
create index if not exists future_messages_user_index on public.future_messages (user_id, deleted_at, show_date);
create index if not exists shop_messages_user_index   on public.shop_messages   (user_id, deleted_at, order_number);
create index if not exists shop_products_user_index   on public.shop_products   (user_id, deleted_at, name);
create index if not exists shop_orders_user_index     on public.shop_orders     (user_id, deleted_at, created_at desc);

-- ---------------------------------------------------------------------
-- ให้ updated_at อัปเดตเอง (ใช้ฟังก์ชัน set_updated_at จาก 001_start.sql)
-- ---------------------------------------------------------------------
drop trigger if exists future_messages_set_updated_at on public.future_messages;
create trigger future_messages_set_updated_at before update on public.future_messages
  for each row execute function public.set_updated_at();

drop trigger if exists shop_messages_set_updated_at on public.shop_messages;
create trigger shop_messages_set_updated_at before update on public.shop_messages
  for each row execute function public.set_updated_at();

drop trigger if exists shop_products_set_updated_at on public.shop_products;
create trigger shop_products_set_updated_at before update on public.shop_products
  for each row execute function public.set_updated_at();

drop trigger if exists shop_orders_set_updated_at on public.shop_orders;
create trigger shop_orders_set_updated_at before update on public.shop_orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- ความปลอดภัย (RLS): แต่ละคนเห็นและแก้ได้เฉพาะข้อมูลของตัวเอง
-- ---------------------------------------------------------------------
alter table public.future_messages enable row level security;
alter table public.shop_messages   enable row level security;
alter table public.shop_products   enable row level security;
alter table public.shop_orders     enable row level security;

drop policy if exists "owner only" on public.future_messages;
create policy "owner only" on public.future_messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "owner only" on public.shop_messages;
create policy "owner only" on public.shop_messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "owner only" on public.shop_products;
create policy "owner only" on public.shop_products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "owner only" on public.shop_orders;
create policy "owner only" on public.shop_orders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- อัปเดตสด (Realtime): แก้ในเครื่องหนึ่ง อีกเครื่องเห็นทันที
-- ---------------------------------------------------------------------
alter table public.future_messages replica identity full;
alter table public.shop_messages   replica identity full;
alter table public.shop_products   replica identity full;
alter table public.shop_orders     replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table public.future_messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shop_messages;   exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shop_products;   exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.shop_orders;     exception when duplicate_object then null; end;
end;
$$;
-- =====================================================================
-- 014_shop_captions_category.sql : เพิ่ม "หมวด" ให้แคปชั่น (ไว้กรองตอนมีแคปชั่นเยอะ)
-- วิธีใช้: รันหลัง 013 (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
-- =====================================================================

alter table public.shop_captions add column if not exists category text not null default '';

comment on column public.shop_captions.category is 'หมวดของแคปชั่น พิมพ์ชื่อเอง เช่น โปรโมชั่น, รีวิว (ว่าง = ไม่มีหมวด)';

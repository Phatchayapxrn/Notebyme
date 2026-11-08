-- =====================================================================
-- 015_caption_groups.sql : หมวดหมู่ของแคปชั่นแบบหน้าไอเดีย (สร้างหมวดก่อน แล้วค่อยใส่แคปชั่น)
-- วิธีใช้: รันหลัง 013 (และ 014 ถ้าเคยรันแล้ว) (Supabase → SQL Editor → New query → วาง → Run)
-- รันซ้ำได้ ไม่พัง
--
-- ทำอะไร:
--   1) groups.kind : แยกหมวดของแคปชั่น ('caption') ออกจากหมวดไอเดีย/งาน ('general')
--   2) shop_captions.group_id : แคปชั่นอยู่หมวดไหน (ลบหมวด → แคปชั่นไม่หาย กลายเป็นไม่มีหมวด)
--   3) ถ้าเคยพิมพ์หมวดเป็นข้อความ (คอลัมน์ category จาก 014) → ย้ายเป็นหมวดจริงให้ แล้วลบคอลัมน์เก่า
-- =====================================================================

alter table public.groups add column if not exists kind text not null default 'general';
comment on column public.groups.kind is 'ชนิดหมวด: general = ไอเดีย/งาน, caption = แคปชั่นในหน้าร้าน';

alter table public.shop_captions add column if not exists group_id uuid references public.groups (id) on delete set null;
comment on column public.shop_captions.group_id is 'แคปชั่นอยู่หมวดไหน (ว่าง = ไม่มีหมวด)';
create index if not exists shop_captions_group_index on public.shop_captions (group_id);

-- ย้ายหมวดแบบข้อความ (category) → หมวดจริง (ทำครั้งเดียว: ลบคอลัมน์เก่าทิ้งตอนท้าย)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'shop_captions' and column_name = 'category'
  ) then
    insert into public.groups (user_id, name, emoji, color, cover_picture, order_number, kind)
    select user_id, category, '🏷️', '#F2BFC8', 'pattern:hearts',
           (row_number() over (partition by user_id order by category))::int - 1, 'caption'
    from (select distinct user_id, category from public.shop_captions where category <> '') as old_categories;

    update public.shop_captions as caption
       set group_id = new_group.id
      from public.groups as new_group
     where new_group.user_id = caption.user_id
       and new_group.kind = 'caption'
       and new_group.name = caption.category
       and caption.category <> ''
       and caption.group_id is null;

    alter table public.shop_captions drop column category;
  end if;
end $$;

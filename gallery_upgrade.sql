alter table gallery_items
add column if not exists likes int default 0,
add column if not exists comments jsonb default '[]'::jsonb;

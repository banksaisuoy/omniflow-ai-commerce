INSERT INTO public.products (name, slug, description, price, compare_at_price, cost_price, category, thumbnail_url, images, status, is_featured, tags)
VALUES
('ขนมชั้นใบเตย', 'khanom-chan-pandan', 'ขนมชั้นใบเตยสูตรโบราณ หอมกะทิสด เนื้อนุ่มหนึบ 9 ชั้นมงคล (กล่อง 9 ชิ้น)', 189, 220, 95, 'ขนมไทยโบราณ', 'https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fkhanom-chan.jpg', '["https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fkhanom-chan.jpg"]'::jsonb, 'active', true, '["ใบเตย","กะทิ","ขนมมงคล"]'::jsonb),
('ทองหยิบ ทองหยอด', 'thong-yip-thong-yod', 'ขนมมงคลไข่แดงแท้ หวานละมุน ทำสดใหม่ทุกวัน (กล่อง 12 ชิ้น)', 259, NULL, 130, 'ขนมไทยโบราณ', 'https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fthong-yip.jpg', '["https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fthong-yip.jpg"]'::jsonb, 'active', true, '["ขนมมงคล","ไข่แดง"]'::jsonb),
('ข้าวเหนียวมะม่วง', 'mango-sticky-rice', 'ข้าวเหนียวมูนกะทิสดกับมะม่วงน้ำดอกไม้สุกกำลังดี เสิร์ฟพร้อมกะทิราด', 159, 179, 80, 'ขนมชุด', 'https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fmango-sticky-rice.jpg', '["https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fmango-sticky-rice.jpg"]'::jsonb, 'active', true, '["มะม่วง","กะทิ","ยอดนิยม"]'::jsonb),
('ขนมครกชาววัง', 'khanom-krok', 'ขนมครกหอมกะทิ กรอบนอกนุ่มใน หน้าข้าวโพดและต้นหอม (กล่อง 10 คู่)', 129, NULL, 60, 'ขนมอบ', 'https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fkhanom-krok.jpg', '["https://rfrauluoyvichcjbzqlb.supabase.co/storage/v1/object/public/product-images/seed%2Fkhanom-krok.jpg"]'::jsonb, 'active', false, '["กะทิ","ของว่าง"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.inventory (product_id, quantity, low_stock_threshold)
SELECT p.id, 50, 10 FROM public.products p
WHERE p.slug IN ('khanom-chan-pandan','thong-yip-thong-yod','mango-sticky-rice','khanom-krok')
  AND NOT EXISTS (SELECT 1 FROM public.inventory i WHERE i.product_id = p.id);
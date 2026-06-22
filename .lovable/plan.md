## แผนทำระบบให้สมบูรณ์ (ต่อจากของเดิม)

จะทำตามแผน 7 เฟสที่วางไว้ก่อนหน้า + เพิ่ม Google Sign-in ที่ทำไปแล้ว ให้ครบทุกอย่าง

### Phase 1: ระบบ Admin ปลอดภัย (RBAC)
- Migration: สร้าง `app_role` enum, `user_roles` table, `has_role()` security definer function
- อัปเดต RLS policies ทุกตารางที่เช็ค admin ให้ใช้ `has_role()` แทน profiles.role
- Edge Function `create-admin`: รับ invite code (เก็บใน secret `ADMIN_INVITE_CODE`) → grant admin role
- หน้า `/admin/setup` สำหรับสมัครแอดมินคนแรกด้วย invite code
- อัปเดต `useAuth.tsx` ให้ดึง role จาก `user_roles`

### Phase 2: เพิ่มสินค้าตัวอย่าง
- Insert 10 รายการ (เสื้อผ้า, อิเล็กทรอนิกส์, เครื่องใช้) ผ่าน insert tool พร้อม inventory + รูป unsplash

### Phase 3: AI Chat Assistant (Floating Widget)
- Migration: `chat_messages` (user_id, role, content, conversation_id)
- Edge Function `ai-chat` ใช้ Lovable AI Gateway (`google/gemini-3-flash-preview`) + context สินค้าในร้าน + streaming
- `AIChatWidget.tsx`: floating button มุมขวาล่าง, ใช้ AI SDK `useChat`, render markdown

### Phase 4: Wishlist
- Migration: `wishlists` (user_id, product_id, unique)
- `WishlistButton.tsx` (ปุ่มหัวใจ) บน ProductCard + ProductDetail
- หน้า `/wishlist` + ลิงก์ใน Navbar

### Phase 5: คูปอง/ส่วนลด
- Migration: `coupons` (code, discount_type, discount_value, min_purchase, max_uses, used_count, expires_at, is_active)
- ช่องกรอกคูปองในหน้า Checkout + คำนวณส่วนลด
- หน้า `AdminCoupons.tsx` CRUD คูปอง + เพิ่มเมนูใน AdminLayout

### Phase 6: หน้าโปรไฟล์ลูกค้า
- หน้า `/profile`: ข้อมูลส่วนตัว (แก้ไขได้), ประวัติคำสั่งซื้อ, จำนวน wishlist
- ลิงก์ใน Navbar dropdown

### Phase 7: UI/UX
- `Footer.tsx` (ลิงก์, social, copyright)
- Navbar: avatar + dropdown menu (Profile/Wishlist/Orders/Logout)
- Home: Featured Products + New Arrivals sections
- ProductDetail: breadcrumb + `ReviewSection.tsx` (เขียน/อ่านรีวิว)
- Loading skeletons สวยขึ้น

### Technical Details

**ไฟล์ใหม่**
```text
supabase/migrations/<timestamp>_rbac_features.sql
supabase/functions/ai-chat/index.ts
supabase/functions/create-admin/index.ts
src/components/chat/AIChatWidget.tsx
src/components/layout/Footer.tsx
src/components/products/WishlistButton.tsx
src/components/products/ReviewSection.tsx
src/pages/Profile.tsx
src/pages/Wishlist.tsx
src/pages/AdminSetup.tsx
src/pages/admin/AdminCoupons.tsx
```

**ไฟล์แก้ไข**
```text
src/hooks/useAuth.tsx (ดึง role จาก user_roles)
src/components/layout/Navbar.tsx (avatar dropdown + wishlist link)
src/components/layout/Layout.tsx (Footer + ChatWidget)
src/components/admin/AdminLayout.tsx (เมนู Coupons)
src/pages/admin/AdminDashboard.tsx (route coupons)
src/pages/Home.tsx (Featured/New Arrivals)
src/pages/ProductDetail.tsx (breadcrumb + reviews + wishlist)
src/pages/Checkout.tsx (coupon input)
src/pages/Cart.tsx (wishlist button)
src/components/products/ProductCard.tsx (wishlist button)
src/App.tsx (routes ใหม่)
supabase/config.toml (functions ใหม่)
```

**Secrets ที่จะขอ**: `ADMIN_INVITE_CODE` (สำหรับสมัครแอดมินครั้งแรก) — จะตั้งให้เป็น `OMNIFLOW2026` ตามคำขอ "เพิ่มรหัสแอดมินเพื่อทดสอบ"

หลังเสร็จจะบอกวิธีทดสอบ: เข้า `/admin/setup` → กรอกรหัส `OMNIFLOW2026` → ได้สิทธิ์แอดมิน

## รีดีไซน์: ร้านขนมไทย "OmniFlow → Khanom House" โทนสว่าง

ปรับ Design System ทั้งหมดเป็น **light mode** สำหรับร้านขายขนมไทย โดยคงทุกฟีเจอร์เดิม (Cart, Auth, Admin, AI ฯลฯ) ไว้ครบ — เปลี่ยนเฉพาะ visual layer

### Design Brief

**สี (Cherry Blossom + Thai pastel)**
- `--background`: `#fef9f5` (ครีมอ่อนนุ่ม)
- `--foreground`: `#3d1f2a` (น้ำตาลม่วงเข้ม)
- `--primary`: `#c45c7c` (ชมพูกุหลาบ — สีกุหลาบมอญ/ดอกอัญชัน-กลีบกุหลาบ)
- `--primary-foreground`: `#fef0f5`
- `--secondary`: `#f8c8d8` (ชมพูพาสเทล)
- `--accent`: `#e88aab` (ชมพูสด)
- `--muted`: `#fef0f5`
- `--card`: `#ffffff` กับเงานุ่มสีชมพู
- เพิ่ม supporting tones: เขียวใบเตย `#9bbf8a`, ทองอ่อน `#e8b84a` (สำหรับ badge/highlight)
- Gradients: `linear-gradient(135deg, #fef0f5, #f8c8d8)` สำหรับ hero
- Shadows: ใช้ `hsl(340 60% 70% / 0.15)` (เงาชมพูนุ่ม) แทน shadow ดำ

**ฟอนต์**
- Heading: **DM Serif Display** (หรู โค้งมน เหมือนป้ายร้านขนมโบราณ)
- Body: **Fira Sans** (อ่านง่าย โมเดิร์น)
- ติดตั้งผ่าน `@fontsource/dm-serif-display` + `@fontsource/fira-sans`, import ใน `main.tsx`, ตั้งใน `tailwind.config.ts`

**เลย์เอาต์ (Bento Grid)**
- หน้า Home: hero bento ที่ผสม tile ขนาดต่างกัน — tile ใหญ่โชว์รูปขนมเด่น, tile เล็กโชว์ "เมนูแนะนำ/โปรโมชั่น/หมวดหมู่/รีวิว"
- Products: card grid ปุ่มมุมมน 24px, shadow ชมพูนุ่ม
- ProductCard: bg ขาว, border `secondary/40`, hover ยก 4px + glow ชมพู

**Animation/Motion**
- Fade-up นุ่มๆ (duration 0.6s, ease-out)
- Hover scale 1.02 + shadow ขยาย
- Floating animation เบาๆ บน hero illustration

### ขอบเขตงาน

**ไฟล์ที่จะแก้**
```text
src/index.css                       (เปลี่ยน CSS tokens ทั้งหมดเป็น light mode pastel)
tailwind.config.ts                  (เพิ่ม font family DM Serif + Fira Sans)
src/main.tsx                        (import @fontsource)
src/pages/Home.tsx                  (รีดีไซน์เป็น Bento Grid + เปลี่ยนข้อความเป็นร้านขนมไทย)
src/components/layout/Navbar.tsx    (โลโก้ใหม่ "Khanom House" + สีพาสเทล)
src/components/products/ProductCard.tsx (ปรับ shadow/border ให้นุ่ม)
src/components/admin/AdminLayout.tsx (sidebar light theme)
package.json                        (เพิ่ม fontsource deps ผ่าน bun add)
```

**Dependencies ใหม่**
- `@fontsource/dm-serif-display`
- `@fontsource/fira-sans`

**สิ่งที่ยังไม่แตะ (คงไว้ตามเดิม)**
- Business logic / Routes / Stores / Supabase / Edge functions
- ฟีเจอร์ Admin, Cart, Checkout, Auth, AI ทั้งหมด
- ฟีเจอร์ที่วางแผนไว้ (RBAC, Wishlist, Coupons, Chat) — รอ database กลับมาทำงานก่อนค่อยทำต่อ

### Copy เปลี่ยนแนว
- ชื่อร้าน: "OmniFlow" → "Khanom House" (หรือชื่อที่คุณอยากใช้)
- Hero copy: "ขนมไทยโฮมเมด สูตรต้นตำรับ ส่งตรงถึงบ้านคุณ"
- หมวดหมู่: ขนมหวาน, ขนมเปียก, ขนมแห้ง, เครื่องดื่ม

> หมายเหตุ: ขณะนี้ฐานข้อมูล Lovable Cloud ยัง connection refused อยู่ การรีดีไซน์ครั้งนี้เป็นงาน frontend อย่างเดียว ทำได้เลยไม่ต้องรอ database

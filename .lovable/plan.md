# แผนงาน: 8 Phases + Google Drive Sync

ขอบเขตใหญ่มาก จะทยอยส่งเป็นชุด ๆ โดยรอบนี้เริ่มจาก **Google Drive Integration** (ตามที่เน้น) + **Phase 2 (AI Personalization)** ก่อน ที่เหลือทำต่อในรอบถัดไป

## รอบที่ 1 (ส่งในเทิร์นนี้)

### A. Google Drive Integration
- **Edge Function `gdrive-import`** — รับ `folder_id` → เรียก Google Drive API ผ่าน connector gateway → list ไฟล์รูป → บันทึก URL/สร้าง product draft
- **Edge Function `gdrive-backup`** — export ทุกตารางหลัก (products, orders, customers, loyalty, pos_transactions) → JSON.gz → upload ขึ้น GDrive folder `KhanomHouse-Backups/YYYY-MM-DD.json.gz`
- **Cron schedule** — pg_cron รัน backup ทุกวัน 03:00
- **Admin page `/admin/gdrive`** — ปุ่ม "Import from Drive", "Backup now", ตารางประวัติ backup, ตั้งค่า Folder ID
- ตาราง `gdrive_settings` (folder ids), `gdrive_backups` (history)

### B. Phase 2 — AI Personalization
- **Recommendation Engine**: `useRecommendations` hook + view `product_recommendations` ใช้ pgvector similarity ที่มีอยู่แล้ว
- **AI Chat Widget** (floating): edge function `ai-chat` (Gemini) + `AIChatWidget.tsx` แสดงทุกหน้า
- **Visual Search**: อัปโหลดรูป → Gemini Vision → semantic embedding → match products
- **Voice Search**: Web Speech API → query semantic search ที่มีอยู่

## รอบที่ 2 (เทิร์นถัดไป — ตอบ "ต่อรอบ 2")

### Phase 3 — Checkout & Payments
- Stripe/Omise integration (Thai payment)
- BNPL, Tax rules, Shipping calculator, Address autocomplete

### Phase 4 — Logistics & Lifecycle
- Order tracking timeline, Rider dispatch, Web Push notifications, Email receipts

## รอบที่ 3

### Phase 5 — Community & Content
- Blog CMS, UGC gallery, Live shopping (video stream)

### Phase 6 — Enterprise ERP
- Multi-branch inventory, Recipe/BOM costing, HR (attendance), Accounting export (CSV → GDrive)

## รอบที่ 4

### Phase 7 — Growth & Marketing
- Advanced coupons (BOGO, tier), Email/SMS automation (Resend), A/B testing framework

### Phase 8 — Trust & Security
- 2FA (TOTP), PDPA consent center, Rate limiting on edge functions, i18n (th/en)

---

## Technical Details (รอบ 1)

**Connector**: ใช้ connection `Nattkorn's Google Drive` (std_01kwe81499ekb89jhwk79c66g1) ผ่าน gateway URL `https://connector-gateway.lovable.dev/google_drive/`

**DB migrations รอบนี้**:
- `gdrive_settings` (id, key text unique, value jsonb) — เก็บ folder_id ต่างๆ
- `gdrive_backups` (id, file_id, file_name, size, tables jsonb, created_at, created_by)
- `ai_chat_sessions` + `ai_chat_messages`
- `product_recommendations` materialized-style table (product_id, recommended_ids jsonb, updated_at)

**Files**: ~15 ไฟล์ (3 edge functions, 4 pages, 3 hooks, 2 components, 3 store/util)

พร้อมลุยรอบ 1 เลยครับ — ตอบ "โอเค" หรือปรับแก้ได้เลย
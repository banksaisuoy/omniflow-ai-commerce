
# Khanom House → Enterprise Platform Upgrade

รวมฟีเจอร์ที่เว็บใหญ่ระดับ Shopee / Lazada / Grab / Starbucks / Amazon มี แล้วเลือกที่เหมาะกับร้านขนมไทย + ERP/POS เดิม จัดเป็น 8 เฟส ทำต่อเนื่องได้

---

## Phase 1 — Customer Experience ระดับ Marketplace
- **Loyalty & Rewards**: ระบบแต้ม (1 บาท = 1 แต้ม), tier Bronze/Silver/Gold/VIP, แลกส่วนลด/ของแถม, birthday bonus
- **Referral Program**: โค้ดชวนเพื่อน, tracking, ให้ทั้งสองฝ่าย
- **Flash Sale + Countdown Timer**: สินค้าลดราคาแบบจำกัดเวลา + stock bar real-time
- **Bundle & Combo Builder**: ซื้อ 3 ชิ้น 100฿, "จัดกล่องของขวัญเอง"
- **Gift Card / e-Voucher**: ซื้อบัตรของขวัญ ส่งให้เพื่อนผ่านลิงก์/QR
- **Wishlist + Price Drop Alert**: แจ้งเตือนเมื่อของในลิสต์ลดราคา

## Phase 2 — AI & Personalization ขั้นสูง
- **Recommendation Engine**: "คนที่ซื้อสิ่งนี้มักจะซื้อ...", "For You" feed ตามพฤติกรรม (pgvector + embedding)
- **AI Concierge Chatbot**: ตอบคำถาม แนะนำเมนู สั่งของผ่านแชท (Gemini + function calling)
- **Visual Search**: อัปโหลดรูปขนม → หาสินค้าคล้ายในร้าน
- **Voice Ordering** (ภาษาไทย): กดพูดสั่งของ → AI แปลงเป็น cart
- **Dynamic Pricing Suggestion** (Admin): AI แนะนำราคาตามคู่แข่ง/ดีมานด์
- **AI Review Summary**: สรุปรีวิวเป็น pros/cons ต่อสินค้า
- **Smart Reorder**: "ครบ 30 วันแล้ว สั่งเหมือนเดิมไหม?"

## Phase 3 — Checkout & Payment ครบวงจร
- **Payment Gateway จริง**: Omise / Stripe (บัตรเครดิต), PromptPay QR แบบ dynamic, TrueMoney, ShopeePay
- **Buy Now Pay Later**: ผ่อน 0% (integrate SCB / Kbank)
- **Multi-currency + Tax Rules**: THB/USD, VAT 7%, invoice/receipt PDF
- **Address Book + Google Maps Autocomplete**: หลายที่อยู่, pin location
- **Delivery Options**: จัดส่งด่วน / นัดวัน / รับหน้าร้าน / Lalamove-Grab API
- **Shipping Rate Calculator**: คำนวณตามน้ำหนัก + ระยะทาง
- **Guest Checkout** + email receipt

## Phase 4 — Order Lifecycle & Logistics
- **Order Tracking Real-time**: timeline (รับออเดอร์ → กำลังทำ → ออกจากร้าน → ถึงมือ)
- **Rider/Driver Dispatch**: assign พนักงานส่ง, GPS live map
- **Push Notifications** (Web Push + LINE Notify): อัปเดตทุก step
- **Auto-refund + Return Flow**: กดคืนของ ถ่ายรูป → อนุมัติ → refund
- **Subscription Box**: สมัครรับขนมรายเดือน auto-charge

## Phase 5 — Community & Content
- **Blog / Recipe CMS**: บทความ, สูตร, SEO-optimized
- **User-Generated Content**: อัปรูปกินขนม tag ร้าน แสดงหน้า home
- **Live Shopping**: streaming ขายสด + comment ซื้อทันที
- **Q&A Section** ต่อสินค้า + AI reply แบบ auto-draft
- **Social Share + OG Preview** ทุกหน้าสินค้า

## Phase 6 — ERP / Back-office ระดับ Enterprise
- **Multi-branch / Multi-warehouse**: สต็อกแยกสาขา, โอนสินค้าระหว่างสาขา
- **Purchase Order & Suppliers**: PO, GRN, ต้นทุนเฉลี่ย
- **BOM / Recipe Costing**: คำนวณต้นทุนขนมจากวัตถุดิบ
- **HR-lite**: พนักงาน, กะทำงาน, payroll สรุป
- **Accounting Export**: PEAK / FlowAccount / Xero CSV
- **E-Tax Invoice** (RD format)
- **Audit Log**: ใครแก้อะไรเมื่อไหร่ทุก action

## Phase 7 — Growth, Marketing & SEO
- **Coupon Engine ขั้นสูง**: %, fixed, BOGO, ขั้นต่ำ, จำกัดครั้ง/คน, first-order-only
- **Email/SMS Automation**: cart abandonment, win-back, post-purchase (Resend + Twilio)
- **A/B Testing**: hero banner / CTA
- **Analytics ครบ**: GA4, Meta Pixel, TikTok Pixel, Google Merchant Center feed
- **SEO ขั้นสูง**: schema.org Product/Review/BreadcrumbList, hreflang, PWA + offline
- **Affiliate Program**: influencer ได้ค่าคอมต่อยอดขาย

## Phase 8 — Trust, Security, Ops
- **2FA** (TOTP), session manager, device list
- **GDPR/PDPA**: export data, delete account, consent banner
- **Rate Limiting + Bot Protection** ที่ edge function
- **Backup & Disaster Recovery**: daily snapshot report
- **Feature Flags**: เปิด/ปิดฟีเจอร์ต่อ tier ลูกค้าโดยไม่ deploy
- **Status Page** (uptime) + Sentry error monitoring
- **i18n**: ไทย / EN / 中文

---

## แนวเทคนิคหลัก (สรุป)
- **DB**: เพิ่ม ~25 ตาราง (loyalty_points, referrals, gift_cards, subscriptions, addresses, shipments, warehouses, purchase_orders, recipes, audit_logs, coupons, email_campaigns, feature_flags, translations ฯลฯ) พร้อม RLS + GRANT ครบ
- **Edge Functions ใหม่**: payment-webhook, ai-recommend, ai-concierge, visual-search, voice-to-cart, dispatch-rider, email-automation, tax-invoice-pdf, currency-rates
- **Realtime**: order status, live shopping chat, flash sale stock
- **Storage buckets**: gift-cards, user-content, tax-invoices, recipe-images
- **Frontend**: routes ใหม่ ~30 หน้า (loyalty, gift-cards, subscriptions, blog, live, tracking, referral, address-book, rider-app, branch-manager, feature-flags ฯลฯ)
- **State**: ต่อยอด Zustand + React Query สำหรับ optimistic UI ทุกส่วน

---

## ควรทำก่อน (แนะนำลำดับ)
เพราะทำครบทั้งหมดจะใหญ่มาก (หลายสัปดาห์งาน) แนะนำเริ่มจาก **impact สูง + ต่อยอดง่าย**:

1. **Phase 1** (Loyalty + Flash Sale + Wishlist + Gift Card) — ดึงลูกค้ากลับมาซื้อซ้ำทันที
2. **Phase 3** (Payment จริง + Delivery + Tracking) — ปิดการขายได้จริง
3. **Phase 2** (Recommendation + AI Concierge) — โชว์ความล้ำ
4. ที่เหลือค่อยไล่ทำ

---

## คำถามก่อนลุย
กรุณาเลือก 1 ข้อ:
- **A) จัดเต็มทุก Phase** — ผมจะทยอยทำเป็นชุด ๆ (เริ่ม Phase 1 ก่อนในรอบนี้)
- **B) เริ่ม Phase 1 + 3 + 2** ตามลำดับแนะนำ (impact สูงสุด)
- **C) เลือกเฉพาะฟีเจอร์ที่ชอบ** — บอกมาว่าอยากได้อันไหนบ้าง (เช่น "Loyalty + Flash Sale + Payment + Tracking")

รอคำตอบก่อนเริ่มลงมือ

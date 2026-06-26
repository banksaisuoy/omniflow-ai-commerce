
# Thai Dessert POS + Cashier + Shift Management

ทำต่อบน Stack ปัจจุบัน (React + Vite + Tailwind + shadcn + Lovable Cloud/Supabase) โดยเพิ่ม Module หลังร้านสำหรับขาย หน้าร้าน + จัดการกะ + แคชเชียร์ ไม่รื้อโครงเดิม

## ขอบเขตเฟสนี้
โฟกัสเฉพาะ **POS + Cashier + Shift** ตามที่เลือก ส่วน Kitchen / Inventory / Catering / CRM จะแยกเป็นเฟสถัดไป

## โครงสร้างหน้าใหม่ (Admin Layout เดิม)
```
/admin/pos              หน้าจอขายแบบ Touch-friendly (Tablet)
/admin/pos/shift        เปิด/ปิดกะ + เงินสดในลิ้นชัก
/admin/pos/sessions     ประวัติกะที่ผ่านมา + Z-Report
/admin/pos/transactions รายการบิลทั้งหมด + ค้นหา/รีพรินต์/คืนเงิน
```

## หน้าจอ POS (Touch Layout)
```text
┌─────────────────────────────┬──────────────────────┐
│  Category tabs              │  Cart                │
│  [ขนมสด][ขนมแห้ง][เครื่องดื่ม]  │  - รายการ + qty +/-  │
│                             │  - ส่วนลด/คูปอง       │
│  Product Grid (รูป+ราคา)     │  - VAT 7%             │
│  ปุ่มใหญ่ ๆ กดง่าย             │  - Subtotal/Total    │
│  ค้นหา / สแกนบาร์โค้ด          │                      │
│                             │  [Charge] ปุ่มใหญ่    │
└─────────────────────────────┴──────────────────────┘
```
- Payment Dialog: เงินสด (คำนวณเงินทอน), PromptPay QR (แสดง QR static + ยืนยันรับเงิน), บัตรเครดิต, E-Wallet, แยกชำระ (Split)
- ใบเสร็จพิมพ์ผ่าน `window.print()` ด้วย CSS print stylesheet ขนาด 80mm
- Offline-safe: ใช้ Zustand persist เก็บตะกร้า/บิลค้างไว้ใน localStorage กันรีเฟรชหาย (Full offline sync จะทำเฟสถัดไป)

## Shift Management
- เปิดกะ: ระบุยอดเงินสดเริ่มต้นในลิ้นชัก, ผูก cashier_id = `auth.uid()`
- ระหว่างกะ: ทุกบิลถูกผูก `shift_id` อัตโนมัติ, รองรับ Cash In/Out (เบิก/ฝาก)
- ปิดกะ: นับเงินสดจริง → ระบบคำนวณ Expected vs Actual + Variance → ออก Z-Report (ยอดขายแยกช่องทางชำระ, จำนวนบิล, ส่วนลด, VAT, Void, Refund)
- บล็อกการขายถ้าไม่มีกะเปิดอยู่

## ฐานข้อมูล (Migration ใหม่)
ใช้ตาราง `products` เดิม เพิ่มตารางใหม่:

- `pos_shifts` — cashier_id, branch_id (nullable เผื่ออนาคต multi-branch), opened_at, closed_at, opening_cash, closing_cash_expected, closing_cash_actual, variance, status (open/closed), notes
- `pos_cash_movements` — shift_id, type (in/out), amount, reason, created_by
- `pos_transactions` — receipt_no (auto: POS-YYYYMMDD-####), shift_id, cashier_id, subtotal, discount_total, vat_amount, total, status (paid/voided/refunded), customer_id (nullable), notes
- `pos_transaction_items` — transaction_id, product_id, name_snapshot, unit_price, qty, line_discount, line_total
- `pos_payments` — transaction_id, method (cash/promptpay/card/ewallet), amount, ref_no, change_amount
- `pos_refunds` — transaction_id (ต้นทาง), refund_no, amount, reason, approved_by

RLS:
- ทุกตารางเปิด RLS, อ่าน/เขียนเฉพาะ `authenticated` ที่มี role `admin` หรือ `cashier` (เพิ่ม role ใหม่ใน `app_role` enum)
- Cashier เห็นเฉพาะกะของตัวเอง, Admin เห็นทั้งหมด
- ใช้ `has_role()` security definer ที่มีอยู่แล้ว
- GRANT ให้ `authenticated` + `service_role` ตามมาตรฐาน
- Trigger: ตอน insert `pos_transactions` ตัดสต็อก `inventory` ของ product ที่ขายอัตโนมัติ (transaction-safe ด้วย FOR UPDATE)

## State Management
- `src/stores/posStore.ts` (Zustand + persist) — cart, activeShift, draft transactions
- `src/hooks/usePosShift.ts` — เปิด/ปิดกะ + subscribe realtime shift status
- `src/hooks/usePosCheckout.ts` — สร้าง transaction + payments แบบ atomic (เรียก edge function `pos-checkout`)

## Edge Function
- `pos-checkout` — รับ cart + payments → validate shift open + stock พอ → insert transaction/items/payments + ตัดสต็อก ใน RPC เดียว (SECURITY DEFINER), คืน receipt_no
- ใช้ JWT verify + role check `cashier`/`admin`

## ดีไซน์
- ใช้ design tokens เดิม (Dark Mode Command Center: cyan/purple)
- ปุ่มใหญ่ขั้นต่ำ 64px สำหรับนิ้วโป้ง, grid responsive ปรับตาม Tablet landscape (1024px+) เป็นหลัก
- ใบเสร็จใช้สีขาว/ดำล้วน (print friendly)

## Out of scope เฟสนี้ (จะตามมา)
Kitchen Display, BOM/Recipe, Multi-warehouse Inventory, Catering/Event, Rider, Accounting Report, OCR, Voice Command, PWA offline sync เต็มรูปแบบ

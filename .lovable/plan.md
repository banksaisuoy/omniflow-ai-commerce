# กู้ระบบให้กลับมาใช้งานได้ (Repair & Ship)

ตอนนี้แอปคอมไพล์ไม่ผ่าน — มี 3 ไฟล์ที่เนื้อหาขาดหายกลางไฟล์ (ถูกตัดจากการแก้ไขครั้งก่อน) ทำให้หน้า Products และ Checkout พังทั้งหน้า ต้องซ่อมก่อนแล้วค่อยตรวจการใช้งานจริงทั้งระบบ

## ปัญหาที่ยืนยันแล้ว (จากการรัน typecheck)

- `src/pages/Checkout.tsx` — เหลือ 97 บรรทัด, import ขาด (`useState`, `useForm`, `z`, cart store), `try` ไม่มี `catch`, JSX ไม่ปิด
- `src/pages/Products.tsx` — เหลือ 35 บรรทัด, ไม่มี import เลย, JSX ไม่ปิด, query ไม่มี `queryFn`
- `src/services/paymentService.ts` — หัวไฟล์หาย (ไม่มี import / ไม่มีหัว interface `OrderData`), `processTokenizedPayment` เป็นฟังก์ชันว่าง

มีไฟล์สำรอง `src/pages/Checkout.tsx.orig` (254 บรรทัด) ที่เนื้อหาครบ ใช้เป็นฐานในการกู้ได้

## แผนงาน

1. **กู้ `paymentService.ts`** — เขียนหัวไฟล์ใหม่ (imports + `interface OrderData`) และคงตรรกะ `paymentService.processPayment` เดิมไว้ทั้งหมด
2. **กู้ `Checkout.tsx`** — สร้างใหม่จาก `.orig` ให้ครบทั้งไฟล์ (form + สรุปยอด + คูปอง + PromptPay QR + COD) พร้อม `catch/finally` ที่หายไป
3. **กู้ `Products.tsx`** — เขียนไฟล์ให้สมบูรณ์: imports, `queryFn` ดึงสินค้าจากฐานข้อมูล, ตัวกรองหมวด/ราคา/เรียงลำดับ, grid/list, Voice Search ที่มีอยู่แล้ว
4. **ช่องทางชำระเงิน** — ตัดตัวเลือก "บัตรเครดิต" ออกจากหน้า Checkout ชั่วคราว (เหลือ COD + PromptPay ที่ใช้งานได้จริง) เพราะ Stripe ยังไม่ได้เชื่อม key จริง ฝั่ง `CheckoutForm`/Stripe Elements คงไฟล์ไว้ ไม่ลบ พร้อมเปิดใช้ทันทีที่เชื่อม Stripe
5. **ลบไฟล์ขยะ** — `fix-checkout.mjs`, `fix-checkout2.mjs`, `Checkout.tsx.orig` หลังกู้เสร็จ
6. **ตรวจสอบจริง** — รัน typecheck ให้ผ่าน 0 error แล้วเปิดเบราว์เซอร์ทดสอบ: หน้าแรก → รายการสินค้า → เพิ่มลงตะกร้า → Checkout (COD และ PromptPay) → หน้าสำเร็จ พร้อมเก็บ screenshot และเช็ค console error
7. **เช็คหน้า Admin** — ไล่เปิด `/admin` และหน้าย่อยหลัก (POS, สินค้า, ออเดอร์, คูปอง, สาขา, สูตร, UGC) ดูว่าโหลดได้ไม่มี error แล้วแก้จุดที่พัง

## หมายเหตุด้านเทคนิค

- ไม่แตะ migration/ฐานข้อมูล ในรอบนี้ (สคีมาครบแล้ว) เว้นแต่การทดสอบพบว่าขาด policy/grant จริง
- ฟีเจอร์ที่ต้อง key ภายนอก (Resend email, Web Push, Live shopping, Stripe จริง) ยังไม่ทำในรอบนี้ — จะสรุปให้ตอนท้ายว่าต้องเชื่ออะไรบ้าง

import fs from 'fs';
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');
code = code.replace('_coupon_code: null', '_coupon_code: appliedCoupon?.code || null');
fs.writeFileSync('src/pages/Checkout.tsx', code);
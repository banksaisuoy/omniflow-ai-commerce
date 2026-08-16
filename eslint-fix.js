const fs = require('fs');
let cartFile = fs.readFileSync('src/pages/Cart.tsx', 'utf8');
cartFile = cartFile.replace('product={p as any}', 'product={p as unknown as { id: string; name: string; description: string | null; price: number; compare_at_price: number | null; thumbnail_url: string | null; category: string | null; slug: string; }}');
fs.writeFileSync('src/pages/Cart.tsx', cartFile);

let checkoutFile = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');
checkoutFile = checkoutFile.replace('const order = data as any;', 'const order = data as unknown as { id: string; order_number: string };');
checkoutFile = checkoutFile.replace('const receipt = receiptData as any;', 'const receipt = receiptData as unknown as { transaction_id: string };');
fs.writeFileSync('src/pages/Checkout.tsx', checkoutFile);

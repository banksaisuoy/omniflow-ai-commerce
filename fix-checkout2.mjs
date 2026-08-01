import fs from 'fs';
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');
code = code.replace('const clearCart = useCartStore((state) => state.clearCart);', 'const clearCart = useCartStore((state) => state.clearCart);\n  const appliedCoupon = useCartStore((state) => state.appliedCoupon);');
fs.writeFileSync('src/pages/Checkout.tsx', code);
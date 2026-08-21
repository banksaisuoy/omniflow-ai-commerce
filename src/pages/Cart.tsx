import { ProductCard } from '@/components/products/ProductCard';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getShippingFee, getFinalTotal, clearCart, getTotalItems, orderNote, setOrderNote } = useCartStore();
  const { products: recentlyViewedProducts } = useRecentlyViewedStore();

  if (items.length === 0) {
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span className={getShippingFee() === 0 ? "text-success" : ""}>
                      {getShippingFee() === 0 ? "ฟรี" : `฿${getShippingFee().toLocaleString()}`}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-primary">฿{getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>

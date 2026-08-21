import { useCartStore } from '@/stores/cartStore';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getTotalPrice, getShippingFee, getFinalTotal, getTotalItems } = useCartStore();

  return (
    <Sheet>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                <span className={getShippingFee() === 0 ? "text-success font-medium" : "text-foreground"}>
                  {getShippingFee() === 0 ? "ฟรี" : `฿${getShippingFee().toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">฿{getFinalTotal().toLocaleString()}</span>
              </div>
            </div>

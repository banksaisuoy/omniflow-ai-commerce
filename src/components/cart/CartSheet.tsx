import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, savedItems = [], removeItem, updateQuantity, getTotalPrice, getTotalItems, getShippingCost, getFinalTotal, clearCart, saveForLater, moveToCart, removeSavedItem, clearSavedItems, discountAmount, setDiscountAmount } = useCartStore();
  const [promoCode, setPromoCode] = useState('');

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'KHANOM10') {
      setDiscountAmount(50);
      toast.success('ใช้โค้ดส่วนลด 50 บาทสำเร็จ!');
      setPromoCode('');
    } else {
      toast.error('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    toast.success('ยกเลิกการใช้โค้ดส่วนลดแล้ว');
  };

  const handleShareCart = async () => {
    if (items.length === 0) return;
    try {
      const summary = items.map(item => `${item.quantity}x ${item.name} (฿${item.price.toLocaleString()})`).join('\n');
      const text = `ตะกร้าของฉัน:\n${summary}\n\nรวม: ฿${getTotalPrice().toLocaleString()}`;
      if (navigator.share) {
        await navigator.share({
          title: 'ตะกร้าของฉัน',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('คัดลอกรายการสินค้าแล้ว', { description: 'คุณสามารถวางในแชทเพื่อแชร์ได้เลย' });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('ไม่สามารถแชร์หรือคัดลอกได้');
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              ตะกร้าของฉัน
              <Badge variant="secondary" className="ml-2 rounded-full">
                {getTotalItems()}
              </Badge>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs font-normal"
              >
                ล้างตะกร้า
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full pr-4 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12 space-y-4">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p>ยังไม่มีสินค้าในตะกร้า</p>
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link to="/products">เริ่มช้อปปิ้ง</Link>
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1">{item.name}</h4>
                        <p className="text-primary font-medium text-sm">
                          ฿{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-background">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-r-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-l-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary h-7 w-7"
                            onClick={() => saveForLater(item.id)}
                            title="Save for later"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-7 w-7"
                            onClick={() => removeItem(item.id)}
                          >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
              {savedItems.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      บันทึกไว้ดูภายหลัง ({savedItems.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSavedItems}
                      className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs font-normal"
                    >
                      ล้างทั้งหมด
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {savedItems.map((item) => (
                      <div key={item.id} className="flex gap-4 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-xs line-clamp-2 leading-tight mb-1">{item.name}</h4>
                            <p className="text-primary font-medium text-xs">
                              ฿{item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => moveToCart(item.id)}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              ย้ายลงตะกร้า
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive h-7 w-7"
                              onClick={() => removeSavedItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

          </ScrollArea>
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-border/50 bg-background space-y-4">
            {/* Free Shipping Progress */}
            {getShippingCost() > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>ซื้ออีก ฿{(500 - getTotalPrice()).toLocaleString()} เพื่อจัดส่งฟรี</span>
                </div>
                <Progress value={(getTotalPrice() / 500) * 100} className="h-2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-primary">
                  <span>ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรี 🎉</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            )}

            <div className="flex gap-2 pb-2 border-b border-border/50">
              <Input
                placeholder="กรอกโค้ดส่วนลด..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={handleApplyPromo} className="h-9 px-4 shrink-0">
                ใช้โค้ด
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ยอดรวมสินค้า</span>
                <span>฿{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง {getTotalPrice() < 500 && '(ฟรีเมื่อซื้อครบ 500 บาท)'}</span>
                {getShippingCost() === 0 ? (
                  <span className="text-success font-medium">ฟรี</span>
                ) : (
                  <span>฿{getShippingCost().toLocaleString()}</span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>ส่วนลด</span>
                  <div className="flex items-center gap-2">
                    <span>-฿{discountAmount.toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground hover:text-destructive" onClick={handleRemovePromo}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-1.5 border-t border-border/50">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">฿{getFinalTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/cart">ดูตะกร้า</Link>
                </Button>
              </SheetClose>
              <Button variant="outline" className="w-full" onClick={handleShareCart}>
                <Share2 className="mr-1.5 h-4 w-4" />
                แชร์ตะกร้า
              </Button>
              <SheetClose asChild>
                <Button className="w-full col-span-2" asChild>
                  <Link to="/checkout">
                    ชำระเงิน
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
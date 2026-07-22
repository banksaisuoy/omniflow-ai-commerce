import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
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
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();
  const { products: recentlyViewed } = useRecentlyViewedStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            ตะกร้าของฉัน
            <Badge variant="secondary" className="ml-2 rounded-full">
              {getTotalItems()}
            </Badge>
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

                {recentlyViewed.length > 0 && (
                  <div className="w-full mt-12 pt-8 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-4 text-center">คุณอาจสนใจ</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {recentlyViewed.slice(0, 4).map(p => (
                        <SheetClose asChild key={p.id}>
                          <Link to={`/product/${p.slug}`} className="group relative block overflow-hidden rounded-xl border border-border/50 bg-card p-2 hover:border-primary/50 transition">
                            <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                              {p.thumbnail_url ? (
                                <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary text-[10px]">No Image</div>
                              )}
                            </div>
                            <p className="text-xs font-medium line-clamp-1 text-foreground">{p.name}</p>
                            <p className="text-xs text-primary font-semibold mt-1">฿{p.price.toLocaleString()}</p>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                )}
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
          </ScrollArea>
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-border/50 bg-background space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                <span className="text-success font-medium">ฟรี</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">฿{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/cart">ดูตะกร้า</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button className="w-full" asChild>
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

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useCartStore } from '@/stores/cartStore';

export function CartSheet({ children }: { children: React.ReactNode }) {
          </SheetTitle>
        </SheetHeader>

        
        
        
        {items.length > 0 && (
          <div className="px-6 py-4 bg-primary/5 border-b border-border/50">
            <div className="flex justify-between text-sm mb-2">
              {getTotalPrice() < 500 ? (
                <span>ซื้ออีก <span className="font-bold text-primary">฿{(500 - getTotalPrice()).toLocaleString()}</span> รับสิทธิ์ส่งฟรี</span>
              ) : (
                <span className="font-bold text-success">🎉 ยินดีด้วย! ได้รับสิทธิ์ส่งฟรี</span>
              )}
            </div>
            <Progress value={Math.min(100, (getTotalPrice() / 500) * 100)} className="h-1.5" />
          </div>
        )}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full pr-4 py-4">
            {items.length === 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                {getTotalPrice() >= 500 ? (
                  <span className="text-success font-medium">ฟรี</span>
                ) : (
                  <span>฿50</span>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">฿{(getTotalPrice() + (getTotalPrice() >= 500 ? 0 : 50)).toLocaleString()}</span>
              </div>
            </div>

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { ProductCard } from '@/components/products/ProductCard';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, getTotalItems, orderNote, setOrderNote } = useCartStore();
  const { products: recentlyViewedProducts } = useRecentlyViewedStore();

  const subtotal = getTotalPrice();
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 50;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shippingCost;
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center min-h-[50vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">ตะกร้าว่างเปล่า</h1>
            <p className="text-muted-foreground mb-6">ยังไม่มีสินค้าในตะกร้า</p>
            <Button asChild>
              <Link to="/products">เริ่มช้อปปิ้ง</Link>
            </Button>
          </motion.div>
        </div>

        {recentlyViewedProducts.length > 0 && (
          <div className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as unknown as { id: string; name: string; price: number; compare_at_price: number | null; thumbnail_url: string | null; category: string | null; slug: string; description: string | null; description_html: string | null; tags: unknown; created_at: string; updated_at: string; status: string; admin_id: string; is_archived: boolean; }} />
              ))}
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-4xl md:text-5xl mb-8">ตะกร้าขนม</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-primary font-medium">
                          ฿{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  ล้างตะกร้า
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการล้างตะกร้า?</AlertDialogTitle>
                  <AlertDialogDescription>
                    การกระทำนี้จะลบสินค้าทั้งหมดออกจากตะกร้าของคุณและไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCart} className="bg-destructive hover:bg-destructive/90">
                    ล้างตะกร้า
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>

                <div className="bg-muted/50 p-4 rounded-xl mb-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center font-medium">
                      <Truck className="h-4 w-4 mr-2 text-primary" />
                      {isFreeShipping
                        ? <span className="text-success">ยินดีด้วย! คุณได้รับสิทธิ์ส่งฟรี</span>
                        : <span>ซื้อเพิ่มอีก ฿{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} เพื่อรับสิทธิ์ส่งฟรี</span>
                      }
                    </div>
                  </div>
                  <Progress value={shippingProgress} className="h-2" />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า ({getTotalItems()} ชิ้น)</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    {isFreeShipping ? (
                      <span className="text-success">ฟรี</span>
                    ) : (
                      <span>฿{SHIPPING_FEE.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-primary">฿{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <label htmlFor="order-note" className="text-sm font-medium">หมายเหตุคำสั่งซื้อ</label>
                  <Textarea
                    id="order-note"
                    placeholder="เช่น ระบุความหวาน, การแพ็คของขวัญ..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="resize-none h-20 text-sm"
                  />
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout">
                    ดำเนินการสั่งซื้อ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

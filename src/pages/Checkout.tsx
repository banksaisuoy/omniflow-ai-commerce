import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, Mail, Tag, QrCode, Check } from 'lucide-react';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generatePromptPayQR } from '@/lib/promptpay';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ'),
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์'),
  address: z.string().min(10, 'กรุณากรอกที่อยู่'),
});

type PaymentMethod = 'cod' | 'promptpay';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    orderNotes: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getTotalPrice();
  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percent'
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data, error } = await supabase.rpc('validate_coupon', {
      _code: couponCode.trim(),
      _subtotal: subtotal,
    });
    if (error) {
      toast.error('ไม่สามารถตรวจสอบคูปองได้');
      return;
    }
    const result = data as any;
    if (!result?.valid) {
      const reason = result?.reason;
      if (reason === 'expired') toast.error('คูปองหมดอายุแล้ว');
      else if (reason === 'exhausted') toast.error('คูปองถูกใช้ครบจำนวนแล้ว');
      else if (reason === 'min_order') toast.error(`ยอดขั้นต่ำ ฿${result.min_order}`);
      else toast.error('ไม่พบคูปองนี้');
      return;
    }
    setAppliedCoupon({
      code: result.code,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      discount: result.discount,
    });
    toast.success(`ใช้คูปอง ${result.code} สำเร็จ!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      checkoutSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase.rpc('create_order', {
        _items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
        _customer_name: formData.fullName,
        _customer_email: formData.email,
        _shipping_address: {
          name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        },
        _payment_method: paymentMethod,
        _coupon_code: appliedCoupon?.code || null,
        _notes: formData.orderNotes || null,
      });
      if (error) throw error;
      const order = data as any;

      if (paymentMethod === 'promptpay') {
        const dataUrl = await generatePromptPayQR(Number(order.total));
        setQrDataUrl(dataUrl);
        setPendingOrderId(order.id);
        setQrOpen(true);
      } else {
        clearCart();
        toast.success('สั่งซื้อสำเร็จ!');
        navigate(`/order-success/${order.id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const msg = error?.message || '';
      if (msg.includes('invalid_product')) toast.error('สินค้าบางรายการไม่พร้อมจำหน่าย');
      else if (msg.includes('coupon_expired')) toast.error('คูปองหมดอายุแล้ว');
      else if (msg.includes('coupon_exhausted')) toast.error('คูปองถูกใช้ครบจำนวนแล้ว');
      else if (msg.includes('coupon_min_order')) toast.error('ยอดคำสั่งซื้อไม่ถึงขั้นต่ำของคูปอง');
      else if (msg.includes('invalid_coupon')) toast.error('คูปองไม่ถูกต้อง');
      else toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmPromptPayPaid = () => {
    clearCart();
    setQrOpen(false);
    toast.success('ขอบคุณค่ะ ทางร้านกำลังตรวจสอบการชำระเงิน');
    if (pendingOrderId) navigate(`/order-success/${pendingOrderId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ชำระเงิน</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />ข้อมูลการจัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                      <Input id="fullName" value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" className="pl-10" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" className="pl-10" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                    <Input id="address" value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderNotes">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
                    <textarea
                      id="orderNotes"
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="เช่น ต้องการให้เขียนการ์ดอวยพร, แพ้อาหารบางชนิด, คำแนะนำในการจัดส่ง ฯลฯ"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />วิธีการชำระเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                    <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${paymentMethod==='cod'?'border-primary bg-primary/5':''}`}>
                      <RadioGroupItem value="cod" className="mt-1" />
                      <div>
                        <p className="font-medium">ชำระเงินปลายทาง (COD)</p>
                        <p className="text-sm text-muted-foreground">ชำระเงินเมื่อได้รับสินค้า</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${paymentMethod==='promptpay'?'border-primary bg-primary/5':''}`}>
                      <RadioGroupItem value="promptpay" className="mt-1" />
                      <div className="flex-1">
                        <p className="font-medium flex items-center gap-2"><QrCode className="h-4 w-4" />PromptPay QR</p>
                        <p className="text-sm text-muted-foreground">สแกน QR ผ่านแอปธนาคาร โอนตามยอดจริง</p>
                      </div>
                    </label>
                  </RadioGroup>
                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>สรุปคำสั่งซื้อ</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        <p className="text-sm font-medium">฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Coupon */}
                <div className="mb-4">
                  <Label className="flex items-center gap-1 mb-2"><Tag className="h-3 w-3" />โค้ดส่วนลด</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded bg-primary/10 text-sm">
                      <span className="font-mono font-bold">{appliedCoupon.code}</span>
                      <button type="button" onClick={() => setAppliedCoupon(null)} className="text-xs underline">ลบ</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="เช่น WELCOME10" />
                      <Button type="button" variant="outline" onClick={applyCoupon}>ใช้</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>ส่วนลด</span>
                      <span>-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span className="text-success">ฟรี</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-primary">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />สแกนเพื่อชำระเงิน</DialogTitle>
          </DialogHeader>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
            {qrDataUrl && <img src={qrDataUrl} alt="PromptPay QR" className="mx-auto rounded-lg border" />}
            <div>
              <p className="text-sm text-muted-foreground">ยอดที่ต้องชำระ</p>
              <p className="text-3xl font-bold text-primary">฿{total.toLocaleString()}</p>
            </div>
            <Button className="w-full" onClick={confirmPromptPayPaid}>
              <Check className="h-4 w-4 mr-2" />ชำระเงินแล้ว
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

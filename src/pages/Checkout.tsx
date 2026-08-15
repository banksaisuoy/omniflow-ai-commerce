import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, QrCode } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { generatePromptPayQR } from '@/lib/promptpay';
import { analyzeTransaction } from '@/fraud-detection';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทร'),
  address: z.string().min(10, 'กรุณากรอกที่อยู่'),
  couponCode: z.string().optional(),
  orderNotes: z.string().optional(),
});

type PaymentMethod = 'cod' | 'promptpay';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 50;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      couponCode: '',
      orderNotes: '',
    },
  });

  const cartItemIds = items.map((i) => i.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (paymentMethod !== 'promptpay' || total <= 0) {
      setQrCode(null);
      return;
    }
    let active = true;
    generatePromptPayQR(total)
      .then((url) => { if (active) setQrCode(url); })
      .catch(() => { if (active) setQrCode(null); });
    return () => { active = false; };
  }, [paymentMethod, total]);

  const onSubmit = async (formData: z.infer<typeof checkoutSchema>) => {
    setIsSubmitting(true);

    try {
      // Fraud Detection Check (Mocked data for demonstration)
      const fraudAnalysis = analyzeTransaction({
        userId: user?.id || null,
        amount: total,
        paymentMethod: paymentMethod,
        timestamp: Date.now()
      });
      
      if (fraudAnalysis.isBlocked) {
        throw new Error('Transaction blocked due to security reasons.');
      }

      const { data, error } = await supabase.rpc('create_order', {
        _items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
        _customer_name: formData.fullName,
        _customer_email: formData.email,
        _shipping_address: {
          address: formData.address,
          phone: formData.phone,
          notes: formData.orderNotes || '',
        },
        _payment_method: paymentMethod,
        _coupon_code: formData.couponCode?.trim() || null,
      });
      if (error) throw error;
      const order = data as any;

      clearCart();
      toast.success('สร้างคำสั่งซื้อสำเร็จ');
      navigate('/order-success', { state: { orderId: order?.id } });
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandardSubmit = form.handleSubmit((data) => onSubmit(data));

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">ไม่มีสินค้าในตะกร้า</h1>
          <Button onClick={() => navigate('/products')}>เลือกซื้อสินค้า</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold">เช็คเอาท์</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ-นามสกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทรศัพท์</FormLabel>
                      <FormControl>
                        <Input placeholder="0812345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>โค้ดส่วนลด (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input placeholder="KHANOM10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ที่อยู่จัดส่ง</FormLabel>
                    <FormControl>
                      <Textarea placeholder="บ้านเลขที่ ถนน ซอย ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ตัวอย่าง: วางไว้หน้าบ้าน" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 border-t">
                <h3 className="text-lg font-bold mb-4">ช่องทางการชำระเงิน</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  className="space-y-3"
                >
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${paymentMethod==='cod'?'border-primary bg-primary/5':''}`}>
                    <RadioGroupItem value="cod" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2"><Banknote className="h-4 w-4" />เก็บเงินปลายทาง (COD)</p>
                      <p className="text-sm text-muted-foreground">ชำระเงินสดเมื่อได้รับสินค้า</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${paymentMethod==='promptpay'?'border-primary bg-primary/5':''}`}>
                    <RadioGroupItem value="promptpay" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2"><QrCode className="h-4 w-4" />โอนเงินผ่านบัญชีธนาคาร (PromptPay)</p>
                      <p className="text-sm text-muted-foreground">สแกน QR ผ่านแอปธนาคาร โอนตามยอดจริง</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {paymentMethod === 'promptpay' && (
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
                  <p className="font-medium">สแกนเพื่อชำระเงิน ฿{total.toLocaleString()}</p>
                  {qrCode ? (
                    <img src={qrCode} alt="PromptPay QR สำหรับชำระเงิน" className="w-56 h-56" />
                  ) : (
                    <p className="text-sm text-muted-foreground">กำลังสร้าง QR...</p>
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    โอนแล้วกดยืนยันคำสั่งซื้อ ทางร้านจะตรวจสอบยอดก่อนจัดส่ง
                  </p>
                </div>
              )}

              <Button type="button" onClick={handleStandardSubmit} className="w-full mt-6" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <div className="bg-muted p-6 rounded-lg sticky top-8">
            <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                <span>ยอดรวมสินค้า</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                {isFreeShipping ? (
                  <span className="text-success font-medium">ฟรี</span>
                ) : (
                  <span>฿{shippingFee.toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="border-t pt-4 font-bold flex justify-between">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-xl text-primary">฿{total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <RecommendationCarousel cartIds={cartItemIds} title="You might also like" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

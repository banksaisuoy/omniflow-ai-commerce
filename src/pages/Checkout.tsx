import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Banknote, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { supabase } from '@/integrations/supabase/client';
import { generatePromptPayQR } from '@/lib/promptpay';
import { encryptPaymentData } from '@/payment/services/security';
import { analyzeTransaction } from '@/fraud-detection';
import { processTokenizedPayment, OrderData } from '@/services/paymentService';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

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
  address: z.string().min(10, 'กรุณากรอกที่อยู่'),
  orderNotes: z.string().optional(),
});

type PaymentMethod = 'cod' | 'promptpay' | 'credit_card';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      address: '',
      orderNotes: '',
    },
  });

  const cartItemIds = items.map((i) => i.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const onSubmit = async (formData: z.infer<typeof checkoutSchema>, stripe?: any, elements?: any) => {
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

      let order: any;

      if (paymentMethod === 'credit_card') {
        const orderData: OrderData = {
          items: items.map(it => ({ id: it.id, quantity: it.quantity })),
          paymentMethod,
          couponCode: appliedCoupon?.code || null,
          notes: formData.orderNotes || ''
        };
        
        order = await processTokenizedPayment(stripe, elements, orderData);
      } else {
        const { data, error } = await supabase.rpc('create_order', {
          _items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
          _payment_method: paymentMethod,
          _coupon_code: appliedCoupon?.code || null,
          _notes: formData.orderNotes || '',
        });
        if (error) throw error;
        order = data;
      }
      
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
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${paymentMethod==='credit_card'?'border-primary bg-primary/5':''}`}>
                    <RadioGroupItem value="credit_card" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" />Credit Card (Secure)</p>
                      <p className="text-sm text-muted-foreground">ชำระผ่านบัตรเครดิตด้วยระบบเข้ารหัส AES-256</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {paymentMethod === 'credit_card' ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    onSubmit={async (stripe, elements) => {
                      const isValid = await form.trigger();
                      if (isValid) {
                        onSubmit(form.getValues(), stripe, elements);
                      }
                    }} 
                    isSubmitting={isSubmitting} 
                  />
                </Elements>
              ) : (
                <Button type="button" onClick={handleStandardSubmit} className="w-full mt-6" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
                </Button>
              )}
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
            </div>
            <div className="border-t pt-4 font-bold flex justify-between">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-xl">฿{total.toLocaleString()}</span>
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

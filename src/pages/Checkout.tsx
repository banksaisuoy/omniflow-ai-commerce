import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, Mail, CheckCircle, QrCode, Building, Upload } from 'lucide-react';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ'),
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์'),
  address: z.string().min(10, 'กรุณากรอกที่อยู่'),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'bank_transfer'>('promptpay');
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

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
      // Generate order number
      const { data: orderNumberData } = await supabase.rpc('generate_order_number');
      const orderNumber = orderNumberData || `OMN-${Date.now()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: user?.id || null,
          customer_name: formData.fullName,
          customer_email: formData.email,
          subtotal: getTotalPrice(),
          total: getTotalPrice(),
          status: 'pending',
          payment_status: 'pending',
          shipping_address: {
            name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.thumbnail_url,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast.success('สั่งซื้อสำเร็จ!');
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ชำระเงิน</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    ข้อมูลการจัดส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    วิธีการชำระเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup defaultValue="promptpay" onValueChange={(v) => setPaymentMethod(v as any)}>
                    <div className="flex items-center space-x-2 border p-4 rounded-lg mb-2">
                      <RadioGroupItem value="promptpay" id="promptpay" />
                      <Label htmlFor="promptpay" className="flex items-center gap-2 cursor-pointer w-full">
                        <QrCode className="h-5 w-5 text-primary" />
                        สแกน QR Code (PromptPay)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer w-full">
                        <Building className="h-5 w-5 text-primary" />
                        โอนเงินผ่านธนาคาร
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'promptpay' && (
                    <div className="bg-muted p-6 rounded-lg text-center space-y-4 animate-in fade-in">
                      <p className="font-medium">สแกนเพื่อชำระเงิน</p>
                      <div className="w-48 h-48 bg-white mx-auto p-2 rounded-xl shadow-sm border border-border flex items-center justify-center">
                        {/* Mock QR Code representation */}
                        <div className="w-full h-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center flex-col gap-2 text-muted-foreground">
                           <QrCode className="w-12 h-12" />
                           <span className="text-xs">Mock QR Code</span>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-primary">฿{getTotalPrice().toLocaleString()}</p>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-muted p-6 rounded-lg space-y-4 animate-in fade-in">
                      <p className="font-medium text-center border-b pb-4">โอนเงินเข้าบัญชี</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ธนาคาร:</span>
                          <span className="font-medium">กสิกรไทย (KBANK)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ชื่อบัญชี:</span>
                          <span className="font-medium">บจก. ขนมเฮาส์</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">เลขที่บัญชี:</span>
                          <span className="font-medium font-mono">123-4-56789-0</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t mt-2">
                          <span className="text-muted-foreground">ยอดที่ต้องโอน:</span>
                          <span className="font-bold text-primary">฿{getTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                     <Label>อัปโหลดสลิปโอนเงิน (จำลอง)</Label>
                     <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-not-allowed bg-muted/50">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลด (ระบบจำลอง - ไม่ต้องอัปโหลดจริง)</p>
                     </div>
                  </div>

                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังดำเนินการ...' : 'แจ้งชำระเงินและยืนยันคำสั่งซื้อ'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                        <p className="text-sm font-medium">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                    <span>฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    <span className="text-success">ฟรี</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-primary">฿{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

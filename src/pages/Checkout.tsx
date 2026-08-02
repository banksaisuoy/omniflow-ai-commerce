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

type PaymentMethod = 'cod' | 'promptpay' | 'credit_card';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
          _notes: formData.orderNotes || ''
        });
        if (error) throw error;
        order = data;
      }
      
      clearCart();
      toast.success('สร้างคำสั่งซื้อสำเร็จ');
      navigate('/order-success', { state: { orderId: order?.id } });
    }
  };

  const handleStandardSubmit = form.handleSubmit((data) => onSubmit(data));

  if (items.length === 0) {
    return (
      <Layout>
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
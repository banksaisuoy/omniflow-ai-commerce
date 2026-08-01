import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generatePromptPayQR } from '@/lib/promptpay';
import { encryptPaymentData } from '@/payment/services/security';
import { analyzeTransaction } from '@/fraud-detection';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ'),
  address: z.string().min(10, 'กรุณากรอกที่อยู่'),
});

type PaymentMethod = 'cod' | 'promptpay' | 'credit_card';

export default function Checkout() {
  const navigate = useNavigate();
      }
    }

    // Fraud Detection Check
    const fraudAnalysis = analyzeTransaction({
      userId: user?.id || null,
      amount: total,
      paymentMethod,
      timestamp: Date.now(),
    });

    if (fraudAnalysis.isBlocked) {
      toast.error(`Transaction blocked due to security reasons: ${fraudAnalysis.reasons.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // Encrypt sensitive data for secure submission
    const secureToken = encryptPaymentData({
      paymentMethod,
      amount: total,
      timestamp: Date.now(),
      fraudRiskScore: fraudAnalysis.riskScore
    });

    try {
      const { data, error } = await supabase.rpc('create_order', {
        _items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
        },
        _payment_method: paymentMethod,
        _coupon_code: appliedCoupon?.code || null,
        _notes: (formData.orderNotes || '') + `\n[SECURE_TOKEN: ${secureToken}]`,
      });
      if (error) throw error;
      const order = data as any;
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
                  <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
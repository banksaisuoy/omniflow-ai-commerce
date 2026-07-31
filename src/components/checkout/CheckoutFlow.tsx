import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { validateCartForCheckout } from '@/middleware/cartValidation';
import { createOrder } from '@/actions/orders';
import { StripePaymentWrapper, createPaymentIntent } from '@/lib/payments/stripe';
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    orderNotes: '',
  });

  const subtotal = getTotalPrice();
  
  // 1. Initial cart validation
  React.useEffect(() => {
    const { isValid, error } = validateCartForCheckout(items);
    if (!isValid) {
      toast.error(error);
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.address) {
      toast.error('Please fill in all required shipping fields');
      return;
    }
    
    // Prepare payment intent for next step
    try {
      setIsProcessing(true);
      const res = await createPaymentIntent(subtotal);
      setClientSecret(res.clientSecret);
      setStep('payment');
    } catch (err) {
      toast.error('Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const orderRes = await createOrder({
        ...formData,
        items,
        total: subtotal,
        paymentMethod: 'stripe',
      });

      if (orderRes.success) {
        await sendOrderConfirmationEmail(formData.email, orderRes.orderId, subtotal);
        clearCart();
        toast.success('Order placed successfully!');
        // Update URL to match standard
        navigate(`/checkout/success`); 
      } else {
        toast.error('Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while placing order.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {/* Step indicators */}
        <div className="flex gap-4 mb-8">
          <div className={`p-2 border-b-2 ${step === 'shipping' ? 'border-primary font-bold' : 'border-transparent text-muted-foreground'}`}>
            1. Shipping
          </div>
          <div className={`p-2 border-b-2 ${step === 'payment' ? 'border-primary font-bold' : 'border-transparent text-muted-foreground'}`}>
            2. Payment
          </div>
          <div className={`p-2 border-b-2 ${step === 'review' ? 'border-primary font-bold' : 'border-transparent text-muted-foreground'}`}>
            3. Review
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {step === 'shipping' && (
              <Card>
                <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : 'Continue to Payment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && (
              <Card>
                <CardHeader><CardTitle>Payment Information</CardTitle></CardHeader>
                <CardContent>
                  {clientSecret ? (
                    <StripePaymentWrapper
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onFail={() => toast.error('Payment failed')}
                    />
                  ) : (
                    <div>Loading payment gateway...</div>
                  )}
                  <Button variant="outline" className="mt-4" onClick={() => setStep('shipping')}>
                    Back to Shipping
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'review' && (
              <Card>
                <CardHeader><CardTitle>Review & Confirm</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Shipping To:</h3>
                    <p>{formData.fullName}</p>
                    <p>{formData.email}</p>
                    <p>{formData.address}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Payment:</h3>
                    <p>Card ending in 4242 (Mocked)</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                    <Button className="flex-1" onClick={handlePlaceOrder} disabled={isProcessing}>
                      {isProcessing ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1">{item.name} x{item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">฿{subtotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
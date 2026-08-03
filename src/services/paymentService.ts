import { Stripe, StripeElements } from '@stripe/stripe-js';
import { CardElement } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';

export interface OrderData {
  items: { id: string; quantity: number }[];
  paymentMethod: string;
  couponCode: string | null;
  notes: string;
}

export const processTokenizedPayment = async (
  stripe: Stripe | null,
  elements: StripeElements | null,
  orderData: OrderData
) => {
  if (!stripe || !elements) {
    throw new Error('Stripe has not loaded');
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    throw new Error('Card element not found');
  }

  const { token, error: stripeError } = await stripe.createToken(cardElement);
  if (stripeError) {
    throw new Error(stripeError.message);
  }
  
  if (!token) {
    throw new Error('Token generation failed');
  }

  const tokenizeResponse = await fetch('/api/payments/tokenize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.id })
  });

  if (!tokenizeResponse.ok) {
    const errorData = await tokenizeResponse.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to tokenize payment on server');
  }

  const data = await tokenizeResponse.json();
  const secureToken = data.token; 

  const { data: orderDataRes, error } = await supabase.rpc('create_order', {
    _items: orderData.items.map(it => ({ product_id: it.id, quantity: it.quantity })),
    _payment_method: orderData.paymentMethod,
    _coupon_code: orderData.couponCode,
    _notes: orderData.notes || '',
  });

  if (error) {
    throw new Error(error.message || 'Failed to create order');
  }
  
  return orderDataRes;
};

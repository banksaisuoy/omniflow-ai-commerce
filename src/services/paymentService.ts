import { supabase } from '@/integrations/supabase/client';
import { encryptPaymentData } from '@/payment/services/security';

export interface OrderData {
  items: Array<{ id: string; quantity: number }>;
  paymentMethod: string;
  couponCode: string | null;
  notes: string;
}

export const processTokenizedPayment = async (stripe: any, elements: any, orderData: OrderData) => {
  if (!stripe || !elements) {
    throw new Error('Stripe has not loaded');
  }

  // Create payment method using Elements
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    elements,
    params: {
      billing_details: {
        // We can add billing details here if needed
      }
    }
  });

  if (error) {
    throw error;
  }

  // Encrypt the payment token/ID before sending to the backend
  const encryptedToken = encryptPaymentData(paymentMethod.id);

  // Send the order data along with the encrypted token to our backend
  const orderDataWithToken = {
    ...orderData,
    paymentToken: encryptedToken,
  };

  return paymentService.processPayment(orderDataWithToken);
};

export const paymentService = {
  processPayment: async (orderData: any, idempotencyKey?: string) => {
    if (sanitizedOrderData.cardData) {
      sanitizedOrderData.cardData = '[REDACTED]';
    }
    // Also redact paymentToken from logs
    if (sanitizedOrderData.paymentToken) {
      sanitizedOrderData.paymentToken = '[REDACTED]';
    }
    console.log('Processing payment for order:', JSON.stringify(sanitizedOrderData, null, 2));

    const key = idempotencyKey || crypto.randomUUID();
      return { id: existingOrder.id, status: 'already_processed' };
    }

    // Encrypt the payment token if it isn't already encrypted and exists
    let encryptedToken = orderData.paymentToken;
    if (encryptedToken && !encryptedToken.startsWith('U2FsdGVkX1')) { // Basic check for CryptoJS AES string
       encryptedToken = encryptPaymentData(encryptedToken);
    }

    const { data, error } = await supabase.rpc('create_order', {
      _items: orderData.items.map((it: any) => ({ product_id: it.id, quantity: it.quantity })),
      _payment_method: orderData.paymentMethod,
      _coupon_code: orderData.couponCode,
      _notes: orderData.notes || '',
      _idempotency_key: key, // Passing idempotency key to the RPC
      _payment_token: encryptedToken, // Send encrypted token to backend
    });

    if (error) {

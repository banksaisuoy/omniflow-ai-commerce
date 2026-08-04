import { supabase } from '@/integrations/supabase/client';
import { encryptPaymentData } from '@/payment/services/security';

export interface OrderData {
  items: { id: string; quantity: number }[];
  paymentMethod: string;
  couponCode?: string | null;
  notes?: string;
  paymentToken?: string;
  cardData?: any;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string;
}


export const paymentService = {
  processPayment: async (orderData: OrderData, idempotencyKey?: string) => {
    let sanitizedOrderData = { ...orderData };
    if (sanitizedOrderData.cardData) {
      sanitizedOrderData.cardData = '[REDACTED]';
    }
    console.log('Processing payment for order:', JSON.stringify(sanitizedOrderData, null, 2));

    const key = idempotencyKey || crypto.randomUUID();

    // Encrypt the payment token if it isn't already encrypted and exists
    let encryptedToken = orderData.paymentToken;
    let paymentTokenToClear = orderData.paymentToken;
    if (encryptedToken && !encryptedToken.startsWith('U2FsdGVkX1')) { // Basic check for CryptoJS AES string
       encryptedToken = encryptPaymentData(encryptedToken);
    }
    
    try {
      const { data, error } = await supabase.rpc('create_order', {
        _items: orderData.items.map((it: any) => ({ product_id: it.id, quantity: it.quantity })),
        _customer_name: orderData.customerName ?? '',
        _customer_email: orderData.customerEmail ?? '',
        _shipping_address: {
          address: orderData.shippingAddress ?? '',
          notes: orderData.notes || '',
          idempotency_key: key,
        },
        _payment_method: orderData.paymentMethod,
        _coupon_code: orderData.couponCode ?? undefined,
      } as any);

      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      // Ensure tokens are not leaked in error messages
      throw new Error('Payment processing failed. Please try again.');
    } finally {
      // Clear temporary variables holding tokens
      encryptedToken = null as any;
      paymentTokenToClear = null as any;
      orderData.paymentToken = null as any;
    }
  }
};
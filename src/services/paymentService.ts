  paymentMethod: string;
  couponCode: string | null;
  notes: string;
  paymentToken?: string;
  cardData?: any;
}

export const processTokenizedPayment = async (stripe: any, elements: any, orderData: OrderData) => {
};

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
        _payment_method: orderData.paymentMethod,
        _coupon_code: orderData.couponCode,
        _notes: orderData.notes || '',
        _idempotency_key: key, // Passing idempotency key to the RPC
        _payment_token: encryptedToken, // Send encrypted token to backend
      });

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
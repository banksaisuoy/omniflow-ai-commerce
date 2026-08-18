
export const paymentService = {
  processPayment: async (orderData: OrderData, idempotencyKey?: string) => {
    const sanitizedOrderData = { ...orderData };
    if (sanitizedOrderData.cardData) {
      sanitizedOrderData.cardData = '[REDACTED]';
    }
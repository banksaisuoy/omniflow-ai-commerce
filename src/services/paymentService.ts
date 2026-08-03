    _items: orderData.items.map(it => ({ product_id: it.id, quantity: it.quantity })),
    _payment_method: orderData.paymentMethod,
    _coupon_code: orderData.couponCode,
    _notes: orderData.notes || '',
  });

  if (error) {

import { CartItem } from '@/stores/cartStore';

export const validateCartForCheckout = (items: CartItem[]) => {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      error: 'Cart is empty. Please add items before checking out.',
    };
  }

  // Assuming items have some stock checking logic - mocked for this middleware
  const outOfStockItems = items.filter(item => false); // Modify based on real inventory check

  if (outOfStockItems.length > 0) {
    return {
      isValid: false,
      error: `Some items are out of stock: ${outOfStockItems.map(i => i.name).join(', ')}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

  setOrderNote: (note: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingFee: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      
      getShippingFee: () => {
        const total = get().getTotalPrice();
        return total >= 500 ? 0 : 50;
      },
      
      getFinalTotal: () => {
        return get().getTotalPrice() + get().getShippingFee();
      },
    }),
    {
      name: 'omniflow-cart',
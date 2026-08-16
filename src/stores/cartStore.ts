import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail_url: string | null;
  isBundle?: boolean;
}

interface CartState {
  items: CartItem[];
  orderNote: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOrderNote: (note: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingFee: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderNote: '',
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
          : state.items.filter((i) => i.id !== id),
      })),
      
      clearCart: () => set({ items: [], orderNote: '' }),

      setOrderNote: (note) => set({ orderNote: note }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getShippingFee: () => {
        const total = get().getTotalPrice();
        if (total === 0) return 0;
        return total >= 500 ? 0 : 50;
      },

      getFinalTotal: () => {
        return get().getTotalPrice() + get().getShippingFee();
      },
    }),
    {
      name: 'omniflow-cart',
    }
  )
);

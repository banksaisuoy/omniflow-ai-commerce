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
  savedItems: CartItem[];
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (id: string) => void;
  orderNote: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOrderNote: (note: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingCost: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],

      saveForLater: (id) => set((state) => {
        const itemToSave = state.items.find((i) => i.id === id);
        if (!itemToSave) return state;

        // Remove from cart
        const newItems = state.items.filter((i) => i.id !== id);

        // Add to savedItems if not already there
        const existingSaved = state.savedItems.find((i) => i.id === id);
        if (existingSaved) return { items: newItems };

        return {
          items: newItems,
          savedItems: [...state.savedItems, { ...itemToSave, quantity: 1 }]
        };
      }),

      moveToCart: (id) => set((state) => {
        const itemToMove = state.savedItems.find((i) => i.id === id);
        if (!itemToMove) return state;

        // Remove from savedItems
        const newSavedItems = state.savedItems.filter((i) => i.id !== id);

        // Add to cart
        const existingCartItem = state.items.find((i) => i.id === id);
        if (existingCartItem) {
          return {
            savedItems: newSavedItems,
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }

        return {
          savedItems: newSavedItems,
          items: [...state.items, { ...itemToMove, quantity: 1 }]
        };
      }),

      removeSavedItem: (id) => set((state) => ({
        savedItems: state.savedItems.filter((i) => i.id !== id),
      })),

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
      getShippingCost: () => {
        const total = get().getTotalPrice();
        if (total === 0) return 0;
        return total >= 500 ? 0 : 50;
      },
      getFinalTotal: () => {
        return get().getTotalPrice() + get().getShippingCost();
      },
    }),
    {
      name: 'omniflow-cart',
    }
  )
);

import { create } from 'zustand';

export interface POSCartItem {
  product_id: string | null;
  name: string;
  unit_price: number;
  qty: number;
  line_discount: number;
  thumbnail_url?: string | null;
}

interface POSState {
  items: POSCartItem[];
  discountTotal: number;
  notes: string;
  addItem: (item: Omit<POSCartItem, 'qty' | 'line_discount'> & { qty?: number }) => void;
  setQty: (product_id: string, qty: number) => void;
  removeItem: (product_id: string) => void;
  setLineDiscount: (product_id: string, amount: number) => void;
  setDiscountTotal: (n: number) => void;
  setNotes: (s: string) => void;
  clear: () => void;
  subtotal: () => number;
  total: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  items: [],
  discountTotal: 0,
  notes: '',
  addItem: (item) =>
    set((s) => {
      const existing = s.items.find((i) => i.product_id === item.product_id);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.product_id === item.product_id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
          ),
        };
      }
      return {
        items: [...s.items, { ...item, qty: item.qty ?? 1, line_discount: 0 }],
      };
    }),
  setQty: (pid, qty) =>
    set((s) => ({
      items: s.items
        .map((i) => (i.product_id === pid ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    })),
  removeItem: (pid) => set((s) => ({ items: s.items.filter((i) => i.product_id !== pid) })),
  setLineDiscount: (pid, amount) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.product_id === pid ? { ...i, line_discount: Math.max(0, amount) } : i
      ),
    })),
  setDiscountTotal: (n) => set({ discountTotal: Math.max(0, n) }),
  setNotes: (s) => set({ notes: s }),
  clear: () => set({ items: [], discountTotal: 0, notes: '' }),
  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.unit_price * i.qty - i.line_discount, 0),
  total: () => Math.max(0, get().subtotal() - get().discountTotal),
}));

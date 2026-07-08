import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
  category: string | null;
  slug: string;
  description: string | null;
}

interface RecentlyViewedState {
  products: RecentlyViewedProduct[];
  addProduct: (product: RecentlyViewedProduct) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) => set((state) => {
        const existingIndex = state.products.findIndex(p => p.id === product.id);
        const newProducts = [...state.products];

        if (existingIndex > -1) {
          // Remove if it exists so we can move it to the front
          newProducts.splice(existingIndex, 1);
        }

        // Add to the front
        newProducts.unshift(product);

        // Keep only the last 8 viewed
        if (newProducts.length > 8) {
          newProducts.pop();
        }

        return { products: newProducts };
      }),
    }),
    {
      name: 'omniflow-recently-viewed',
    }
  )
);

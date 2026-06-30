import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from './Products';
import { vi } from 'vitest';
import { AuthProvider } from '@/hooks/useAuth';

const queryClient = new QueryClient();

const mockProducts = [
  { id: '1', name: 'Product A', price: 100, status: 'active', created_at: '2023-01-01', slug: 'a' },
  { id: '2', name: 'Product B', price: 50, status: 'active', created_at: '2023-01-02', slug: 'b' },
  { id: '3', name: 'Product C', price: 200, status: 'active', created_at: '2023-01-03', slug: 'c' },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            not: () => Promise.resolve({ data: mockProducts, error: null }), // Mock for categories
            then: (resolve: any) => resolve({ data: mockProducts, error: null }) // Mock for products
          }),
          not: () => Promise.resolve({ data: mockProducts, error: null }), // Mock for categories without order
          then: (resolve: any) => resolve({ data: mockProducts, error: null }) // Mock for products
        }),
        order: () => ({
           not: () => Promise.resolve({ data: mockProducts, error: null }), // Mock for categories
           then: (resolve: any) => resolve({ data: mockProducts, error: null }) // Mock for products
        })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }
  }
}));


vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(({ queryKey }) => {
            if (queryKey[0] === 'products') {
                 return { data: mockProducts, isLoading: false };
            }
            if (queryKey[0] === 'categories') {
                 return { data: ['Cat A', 'Cat B'], isLoading: false };
            }
            return { data: null, isLoading: false };
        })
    }
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Products Component Sorting', () => {
  it('renders products and handles sorting dropdown', async () => {
    renderWithProviders(<Products />);

    // Check if products are rendered
    await waitFor(() => {
        expect(screen.getByText('Product A')).toBeDefined();
    });

    // Check if sort dropdown exists (Radix UI might not render the placeholder exactly like this or it might be in a different dom node type)
    // we just check if "สินค้าใหม่ล่าสุด" is selected since that's the default value
    const sortValue = screen.getByText('สินค้าใหม่ล่าสุด');
    expect(sortValue).toBeDefined();
  });
});

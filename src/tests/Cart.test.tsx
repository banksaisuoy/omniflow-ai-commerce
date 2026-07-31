import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cart from '../pages/Cart';
import { useCartStore } from '../stores/cartStore';
import { useRecentlyViewedStore } from '../stores/recentlyViewedStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../hooks/useAuth';

vi.mock('@/hooks/useAuth', () => {
  return {
    useAuth: vi.fn().mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    }),
    AuthProvider: ({ children }: any) => <>{children}</>
  };
});

vi.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="mock-navbar">Navbar</div>
}));
vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>
}));
vi.mock('@/components/layout/ScrollToTop', () => ({
  ScrollToTop: () => <div data-testid="mock-scroll">Scroll</div>
}));

// Stub out Framer Motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, className, 'data-testid': testId }: any) => <div className={className} data-testid={testId}>{children}</div>,
      section: ({ children, className }: any) => <section className={className}>{children}</section>,
      h2: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
      p: ({ children, className }: any) => <p className={className}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock intersection observer
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

vi.mock('../stores/cartStore');
vi.mock('../stores/recentlyViewedStore');

describe('Cart UI Component', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders empty cart state when no items are present', () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn().mockReturnValue(0),
      clearCart: vi.fn(),
      getTotalItems: vi.fn().mockReturnValue(0),
      orderNote: '',
      setOrderNote: vi.fn(),
      addItem: vi.fn(),
    });

    vi.mocked(useRecentlyViewedStore).mockReturnValue({
      products: [],
      addProduct: vi.fn(),
    });

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>
    );

    expect(screen.getByText('ตะกร้าว่างเปล่า')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีสินค้าในตะกร้า')).toBeInTheDocument();
    expect(screen.getByText('เริ่มช้อปปิ้ง')).toBeInTheDocument();
  });

  it('renders cart items and order notes field when items are present', () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: [
        { id: '1', name: 'Test Product', price: 100, quantity: 1, thumbnail_url: null }
      ],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn().mockReturnValue(100),
      clearCart: vi.fn(),
      getTotalItems: vi.fn().mockReturnValue(1),
      orderNote: 'Test note',
      setOrderNote: vi.fn(),
      addItem: vi.fn(),
    });

    vi.mocked(useRecentlyViewedStore).mockReturnValue({
      products: [],
      addProduct: vi.fn(),
    });

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>
    );

    expect(screen.getByText('ตะกร้าขนม')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    const noteLabel = screen.getByText('หมายเหตุคำสั่งซื้อ');
    expect(noteLabel).toBeInTheDocument();
    
    const noteTextarea = screen.getByDisplayValue('Test note');
    expect(noteTextarea).toBeInTheDocument();
  });
});

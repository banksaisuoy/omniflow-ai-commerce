import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import OrderTracking from '../OrderTracking';

// Mock Lucide icons to avoid SVG rendering issues in JSDOM
vi.mock('lucide-react', () => ({
  Package: () => <div data-testid="icon-package" />,
  Truck: () => <div data-testid="icon-truck" />,
  CheckCircle: () => <div data-testid="icon-check-circle" />,
  Clock: () => <div data-testid="icon-clock" />,
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
}));

// Mock layout so we focus just on the OrderTracking content
vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layout">{children}</div>,
}));

// Mock react-query
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
}));

describe('OrderTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (orderId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/tracking/${orderId}`]}>
        <Routes>
          <Route path="/tracking/:orderId" element={<OrderTracking />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state correctly', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders('123');

    expect(screen.getByText('กำลังโหลดข้อมูลคำสั่งซื้อ...')).toBeInTheDocument();
  });

  it('renders error state when order is not found', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    renderWithProviders('123');

    expect(screen.getByText('ไม่พบข้อมูลคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByText(/รหัสคำสั่งซื้ออาจไม่ถูกต้อง/)).toBeInTheDocument();
  });

  it('renders order details for a pending order', () => {
    const mockOrder = {
      id: '123',
      order_number: 'ORD-001',
      status: 'pending',
      total: 500,
      customer_name: 'Test Customer',
      shipping_address: {
        name: 'Test Customer',
        phone: '0812345678',
        address: '123 Test St',
      },
      order_items: [
        {
          id: 'item-1',
          product_name: 'Test Product',
          quantity: 2,
          total_price: 500,
        },
      ],
    };

    mockUseQuery.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders('123');

    // Basic details
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();

    // Status should be pending
    const pendingText = screen.getByText('รอชำระเงิน/กำลังตรวจสอบ');
    expect(pendingText).toBeInTheDocument();
    // In our component, active items have 'text-foreground' and inactive have 'text-muted-foreground'
    expect(pendingText.className).toContain('text-foreground');

    // Processing should be inactive
    const processingText = screen.getByText('กำลังเตรียมสินค้า');
    expect(processingText.className).toContain('text-muted-foreground');
  });

  it('renders cancelled state correctly', () => {
    const mockOrder = {
      id: '123',
      order_number: 'ORD-001',
      status: 'cancelled',
      total: 500,
      customer_name: 'Test Customer',
      order_items: [],
    };

    mockUseQuery.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders('123');

    expect(screen.getByText('คำสั่งซื้อถูกยกเลิก')).toBeInTheDocument();
    expect(screen.getByText('หากมีข้อสงสัย กรุณาติดต่อเรา')).toBeInTheDocument();
  });

  it('renders shipped state with active timeline steps', () => {
    const mockOrder = {
      id: '123',
      order_number: 'ORD-001',
      status: 'shipped',
      total: 500,
      customer_name: 'Test Customer',
      order_items: [],
    };

    mockUseQuery.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders('123');

    // Pending, Processing, and Shipped should be active
    const pendingText = screen.getByText('รอชำระเงิน/กำลังตรวจสอบ');
    const processingText = screen.getByText('กำลังเตรียมสินค้า');
    const shippedText = screen.getByText('จัดส่งแล้ว');
    const completedText = screen.getByText('สำเร็จ');

    expect(pendingText.className).toContain('text-foreground');
    expect(processingText.className).toContain('text-foreground');
    expect(shippedText.className).toContain('text-foreground');

    // Completed should still be inactive
    expect(completedText.className).toContain('text-muted-foreground');
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../services/paymentService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(),
    }
  }
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redacts PCI data (PAN/CVV) before logging', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Setup mock to avoid throwing
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
    (supabase.from as any).mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) });
    (supabase.rpc as any).mockResolvedValue({ data: { success: true }, error: null });

    const orderData = {
      items: [{ id: '1', quantity: 1 }],
      paymentMethod: 'credit_card',
      cardData: '4111222233334444' // PAN that should be redacted
    };

    await paymentService.processPayment(orderData);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Processing payment for order:',
      expect.stringContaining('[REDACTED]')
    );
    expect(consoleSpy).not.toHaveBeenCalledWith(
      'Processing payment for order:',
      expect.stringContaining('4111222233334444')
    );
  });

  it('prevents duplicate processing if idempotency key exists', async () => {
    // Setup mock to simulate order already exists
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'order_123' } });
    (supabase.from as any).mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) });
    
    const orderData = { items: [{ id: '1', quantity: 1 }] };
    const result = await paymentService.processPayment(orderData, 'idem_key_123');

    expect(result).toEqual({ id: 'order_123', status: 'already_processed' });
    expect(supabase.rpc).not.toHaveBeenCalledWith('create_order', expect.anything());
  });

  it('passes idempotency key to create_order RPC', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
    (supabase.from as any).mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }) });
    (supabase.rpc as any).mockResolvedValue({ data: { success: true }, error: null });

    const orderData = { items: [{ id: '1', quantity: 1 }] };
    await paymentService.processPayment(orderData, 'idem_key_123');

    expect(supabase.rpc).toHaveBeenCalledWith('create_order', expect.objectContaining({
      _idempotency_key: 'idem_key_123'
    }));
  });
});
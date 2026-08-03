import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../services/paymentService';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
  },
}));

// Mock encryption
vi.mock('@/payment/services/security', () => ({
  encryptPaymentData: vi.fn((data) => `U2FsdGVkX1_${data}_encrypted`),
}));

describe('paymentService token leakage prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redact paymentToken from console.log output', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const mockOrderData = {
      items: [{ id: '1', quantity: 2 }],
      paymentMethod: 'card',
      couponCode: null,
      notes: '',
      paymentToken: 'tok_sensitive_12345',
      cardData: { number: '4242' },
    };

    await paymentService.processPayment(mockOrderData);

    const logCall = consoleSpy.mock.calls[0];
    expect(logCall).toBeDefined();
    const loggedString = logCall[1];
    
    expect(loggedString).toContain('[REDACTED]');
    expect(loggedString).not.toContain('tok_sensitive_12345');
    expect(loggedString).not.toContain('4242');

    consoleSpy.mockRestore();
  });

  it('should encrypt raw tokens before sending to RPC', async () => {
    const mockOrderData = {
      items: [{ id: '1', quantity: 2 }],
      paymentMethod: 'card',
      couponCode: null,
      notes: '',
      paymentToken: 'tok_raw_sensitive_data',
    };

    await paymentService.processPayment(mockOrderData);

    const rpcCallArgs = (supabase.rpc as any).mock.calls[0][1];
    expect(rpcCallArgs._payment_token).toBe('U2FsdGVkX1_tok_raw_sensitive_data_encrypted');
    expect(rpcCallArgs._payment_token).not.toBe('tok_raw_sensitive_data');
  });

  it('should mask errors and not leak tokens in stack traces', async () => {
    // Force RPC to fail with a sensitive message
    (supabase.rpc as any).mockResolvedValueOnce({ 
      data: null, 
      error: new Error('Failed with token tok_super_secret') 
    });

    const mockOrderData = {
      items: [],
      paymentMethod: 'card',
      couponCode: null,
      notes: '',
      paymentToken: 'tok_super_secret',
    };

    try {
      await paymentService.processPayment(mockOrderData);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Payment processing failed. Please try again.');
      expect(error.message).not.toContain('tok_super_secret');
    }
  });

  it('should clear temporary token variables', async () => {
    const mockOrderData = {
      items: [],
      paymentMethod: 'card',
      couponCode: null,
      notes: '',
      paymentToken: 'tok_to_be_cleared',
    };

    await paymentService.processPayment(mockOrderData);

    // Assuming the original orderData object is mutated (as shown in finally block)
    expect(mockOrderData.paymentToken).toBeNull();
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processTokenizedPayment } from '../services/paymentService';
import { mockTokenizeEndpoint, mockWebhookEndpoint } from '../api/payments';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockStripe = {
  createToken: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(),
};

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('processTokenizedPayment', () => {
    const orderData = {
      items: [{ id: '1', quantity: 2 }],
      paymentMethod: 'credit_card',
      couponCode: null,
      notes: 'test',
    };

    it('throws error if stripe is not loaded', async () => {
      await expect(processTokenizedPayment(null, mockElements as any, orderData))
        .rejects.toThrow('Stripe has not loaded');
    });

    it('throws error if card element is not found', async () => {
      mockElements.getElement.mockReturnValueOnce(null);
      await expect(processTokenizedPayment(mockStripe as any, mockElements as any, orderData))
        .rejects.toThrow('Card element not found');
    });

    it('handles stripe token creation error', async () => {
      mockElements.getElement.mockReturnValueOnce({});
      mockStripe.createToken.mockResolvedValueOnce({ error: { message: 'Token creation failed' } });
      await expect(processTokenizedPayment(mockStripe as any, mockElements as any, orderData))
        .rejects.toThrow('Token creation failed');
    });

    it('processes successful payment', async () => {
      mockElements.getElement.mockReturnValueOnce({});
      mockStripe.createToken.mockResolvedValueOnce({ token: { id: 'tok_test' } });
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'conf_test' })
      });
      
      (supabase.rpc as any).mockResolvedValueOnce({ data: { id: 'order_123' }, error: null });

      const result = await processTokenizedPayment(mockStripe as any, mockElements as any, orderData);
      
      expect(result).toEqual({ id: 'order_123' });
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/tokenize', expect.any(Object));
      expect(supabase.rpc).toHaveBeenCalledWith('create_order', expect.objectContaining({
        _payment_method: 'credit_card',
        _notes: 'test\n[SECURE_TOKEN: conf_test]'
      }));
    });
  });

  describe('Mock API Endpoints', () => {
    it('tokenizes valid token', async () => {
      const req = new Request('http://localhost/api/payments/tokenize', {
        method: 'POST',
        body: JSON.stringify({ token: 'tok_123' })
      });
      const res = await mockTokenizeEndpoint(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBe('conf_123');
    });

    it('rejects invalid token', async () => {
      const req = new Request('http://localhost/api/payments/tokenize', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid' })
      });
      const res = await mockTokenizeEndpoint(req);
      expect(res.status).toBe(400);
    });

    it('handles fraud webhook event', async () => {
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: JSON.stringify({
          type: 'radar.early_fraud_warning.created',
          data: { object: { charge: 'ch_123', fraud_type: 'high_risk' } }
        })
      });
      
      const consoleSpy = vi.spyOn(console, 'log');
      const res = await mockWebhookEndpoint(req);
      
      expect(res.status).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith('Fraud detected for charge ch_123: high_risk');
    });
  });
});
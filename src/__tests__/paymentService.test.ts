      expect(global.fetch).toHaveBeenCalledWith('/api/payments/tokenize', expect.any(Object));
      expect(supabase.rpc).toHaveBeenCalledWith('create_order', expect.objectContaining({
        _payment_method: 'credit_card',
        _notes: 'test'
      }));
    });
  });
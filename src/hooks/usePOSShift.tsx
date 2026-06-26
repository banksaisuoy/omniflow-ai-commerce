import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface POSShift {
  id: string;
  cashier_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_cash: number;
  status: 'open' | 'closed';
  closing_cash_expected?: number | null;
  closing_cash_actual?: number | null;
  variance?: number | null;
  notes?: string | null;
}

export function usePOSShift() {
  const { user } = useAuth();
  const [shift, setShift] = useState<POSShift | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setShift(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from('pos_shifts')
      .select('*')
      .eq('cashier_id', user.id)
      .eq('status', 'open')
      .maybeSingle();
    setShift((data as POSShift) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openShift = async (opening_cash: number) => {
    if (!user) throw new Error('not_authenticated');
    const { data, error } = await (supabase as any)
      .from('pos_shifts')
      .insert({ cashier_id: user.id, opening_cash, status: 'open' })
      .select()
      .single();
    if (error) throw error;
    setShift(data as POSShift);
    return data as POSShift;
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    if (!shift) throw new Error('no_open_shift');
    const { data, error } = await (supabase as any).rpc('pos_close_shift', {
      _shift_id: shift.id,
      _actual_cash: actualCash,
      _notes: notes ?? null,
    });
    if (error) throw error;
    await refresh();
    return data as { expected: number; actual: number; variance: number };
  };

  return { shift, loading, openShift, closeShift, refresh };
}

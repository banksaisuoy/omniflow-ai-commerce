import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export function useActiveFlashSale() {
  return useQuery({
    queryKey: ['flash-sale-active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('flash_sales')
        .select('*, items:flash_sale_items(*, product:products(*))')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('ends_at')
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useCountdown(target?: string | Date | null) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!target) return;
    const t = new Date(target).getTime();
    const tick = () => {
      const diff = t - Date.now();
      if (diff <= 0) { setRemaining('หมดเวลา'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

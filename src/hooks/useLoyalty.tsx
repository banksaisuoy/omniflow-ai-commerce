import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const TIER_INFO = {
  bronze: { label: 'Bronze', min: 0, next: 1000, color: 'from-amber-700 to-amber-500', perk: 'สะสมแต้ม 1 บาท = 1 แต้ม' },
  silver: { label: 'Silver', min: 1000, next: 5000, color: 'from-slate-400 to-slate-200', perk: 'ส่วนลด 5% ทุกออเดอร์' },
  gold: { label: 'Gold', min: 5000, next: 20000, color: 'from-yellow-500 to-yellow-300', perk: 'ส่วนลด 10% + ส่งฟรี' },
  vip: { label: 'VIP', min: 20000, next: Infinity, color: 'from-pink-500 to-purple-500', perk: 'ส่วนลด 15% + ของขวัญ birthday' },
} as const;

export function useLoyalty() {
  const { user } = useAuth();

  const { data: account, isLoading } = useQuery({
    queryKey: ['loyalty', user?.id],
    enabled: !!user,
    queryFn: async () => {
      let { data } = await supabase.from('loyalty_accounts').select('*').eq('user_id', user!.id).maybeSingle();
      if (!data) {
        const { data: created } = await supabase.from('loyalty_accounts').insert({ user_id: user!.id }).select().single();
        data = created;
      }
      return data;
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['loyalty-txn', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const tier = (account?.tier ?? 'bronze') as keyof typeof TIER_INFO;
  const info = TIER_INFO[tier];
  const progress = info.next === Infinity ? 100 : Math.min(100, ((account?.lifetime_points ?? 0) - info.min) / (info.next - info.min) * 100);

  return { account, transactions, isLoading, tier, info, progress };
}

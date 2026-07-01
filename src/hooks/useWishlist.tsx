import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, product:products(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const productIds = new Set(items.map((i: any) => i.product_id));

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อน');
      if (productIds.has(productId)) {
        const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
        if (error) throw error;
        return 'removed';
      }
      const { error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
      return 'added';
    },
    onSuccess: (action) => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(action === 'added' ? '❤️ เพิ่มเข้ารายการโปรด' : 'เอาออกจากรายการโปรดแล้ว');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { items, isLoading, productIds, toggle: toggle.mutate, isToggling: toggle.isPending };
}

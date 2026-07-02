import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRecommendations(productId?: string, limit = 4) {
  return useQuery({
    queryKey: ["recs", productId, limit],
    enabled: !!productId,
    queryFn: async () => {
      const { data: rec } = await supabase
        .from("product_recommendations")
        .select("recommended_ids")
        .eq("product_id", productId!)
        .maybeSingle();
      let ids: string[] = Array.isArray(rec?.recommended_ids) ? (rec!.recommended_ids as string[]) : [];
      if (ids.length === 0) {
        const { data: fallback } = await supabase
          .from("products")
          .select("id")
          .eq("status", "active")
          .neq("id", productId!)
          .limit(limit);
        ids = (fallback || []).map((p) => p.id);
      }
      if (!ids.length) return [];
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,slug,price,thumbnail_url,category")
        .in("id", ids.slice(0, limit));
      return prods || [];
    },
  });
}

export function useForYou(limit = 8) {
  return useQuery({
    queryKey: ["for-you", limit],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        const { data } = await supabase.from("products").select("*").eq("status", "active").eq("is_featured", true).limit(limit);
        return data || [];
      }
      const { data: orders } = await supabase
        .from("orders").select("id").eq("customer_id", user.user.id).limit(10);
      const orderIds = (orders || []).map((o) => o.id);
      if (orderIds.length === 0) {
        const { data } = await supabase.from("products").select("*").eq("status", "active").limit(limit);
        return data || [];
      }
      const { data: items } = await supabase
        .from("order_items").select("product_id").in("order_id", orderIds);
      const productIds = Array.from(new Set((items || []).map((i) => i.product_id).filter(Boolean)));
      if (!productIds.length) {
        const { data } = await supabase.from("products").select("*").eq("status", "active").limit(limit);
        return data || [];
      }
      const { data: refProds } = await supabase.from("products").select("category").in("id", productIds);
      const cats = Array.from(new Set((refProds || []).map((p) => p.category).filter(Boolean)));
      const { data: recs } = await supabase
        .from("products").select("*").eq("status", "active").in("category", cats as string[]).limit(limit);
      return recs || [];
    },
  });
}

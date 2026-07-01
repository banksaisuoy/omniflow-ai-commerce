import { useActiveFlashSale, useCountdown } from '@/hooks/useFlashSales';
import { Link } from 'react-router-dom';
import { Flame, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function FlashSaleBanner() {
  const { data } = useActiveFlashSale();
  const remaining = useCountdown(data?.ends_at);
  if (!data) return null;

  return (
    <section className="container mx-auto px-4 my-8">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 animate-pulse" />
            <div>
              <div className="font-display text-2xl">{data.name}</div>
              {data.description && <div className="text-sm opacity-90">{data.description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 font-mono text-lg">
            <Clock className="h-4 w-4" />
            {remaining}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(data.items ?? []).slice(0, 4).map((it: any) => {
            const pct = it.stock_limit > 0 ? (it.sold_count / it.stock_limit) * 100 : 0;
            return (
              <Link key={it.id} to={`/product/${it.product?.slug ?? it.product_id}`}
                    className="bg-white/10 backdrop-blur rounded-2xl p-3 hover:bg-white/20 transition">
                <div className="text-xs opacity-80 truncate">{it.product?.name}</div>
                <div className="font-display text-2xl">฿{Number(it.sale_price).toLocaleString()}</div>
                <Progress value={pct} className="h-1.5 bg-white/20 mt-2" />
                <div className="text-[10px] mt-1 opacity-80">ขายแล้ว {it.sold_count}/{it.stock_limit}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

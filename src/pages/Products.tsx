import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { VoiceSearchButton } from '@/components/products/VoiceSearchButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = ['ขนมไทยโบราณ', 'ขนมอบ', 'ขนมชุด', 'เครื่องดื่ม'];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name, description, price, compare_at_price, thumbnail_url, category, slug')
        .eq('status', 'active');

      if (selectedCategory) query = query.eq('category', selectedCategory);

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else if (sortBy === 'name') query = query.order('name', { ascending: true });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredProducts = products?.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      product.price <= maxPrice
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">สินค้าทั้งหมด</h1>
          <p className="text-muted-foreground mt-2">ขนมไทยทำสดใหม่ทุกวัน จากครัว Khanom House</p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 items-center flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาขนม..."
                className="pl-9"
              />
            </div>
            <VoiceSearchButton onTranscript={(text) => setSearchQuery(text)} />
          </div>

          <div className="flex gap-2 items-center">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                ราคาไม่เกิน ฿{maxPrice}
              </span>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-primary"
                aria-label="กรองตามราคาสูงสุด"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">มาใหม่ล่าสุด</SelectItem>
                <SelectItem value="price_asc">ราคาต่ำ - สูง</SelectItem>
                <SelectItem value="price_desc">ราคาสูง - ต่ำ</SelectItem>
                <SelectItem value="name">ชื่อ A - Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="มุมมองตาราง"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="มุมมองรายการ"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            ทั้งหมด
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">ไม่พบสินค้าที่ค้นหา</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

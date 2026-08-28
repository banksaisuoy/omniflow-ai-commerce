import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { VoiceSearchButton } from '@/components/products/VoiceSearchButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const searchQuery = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
            <div className="relative w-full">
              <Input 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="pr-10"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceSearchButton onResult={(text) => setSearchInput(text)} />
              </div>
            </div>
            <Button type="submit">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
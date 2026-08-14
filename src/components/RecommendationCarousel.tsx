import React, { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { getRecommendations } from '@/api/recommendations';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface RecommendationCarouselProps {
  productId?: string;
  cartIds?: string[];
  title?: string;
  limit?: number;
  context?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  productId,
  cartIds,
  title = 'You might also like',
  limit,
  context
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
      setLoading(true);
      try {
        const data = await getRecommendations(productId, cartIds);
        setRecommendations(data.slice(0, limit || data.length));
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
    };

    fetchRecommendations();
  }, [productId, cartIds, limit]);

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading recommendations...</div>;
    return null;
  }

  return (
    <div className="recommendation-carousel mt-8 pt-8 border-t border-border px-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="w-full relative px-4">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {recommendations.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 sm:-left-6" />
          <CarouselNext className="-right-4 sm:-right-6" />
        </Carousel>
      </div>
    </div>
  );
};

export default RecommendationCarousel;
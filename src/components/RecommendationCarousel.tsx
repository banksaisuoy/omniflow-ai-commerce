import React, { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { getRecommendations } from '@/api/recommendations';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface RecommendationCarouselProps {
  productId?: string;
    return null;
  }

  return (
    <div className="recommendation-carousel mt-8 pt-8 border-t border-border px-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recommendations.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getRecommendations } from '@/api/recommendations';

interface RecommendationCarouselProps {
    return null;
  }

  return (
    <div className="recommendation-carousel mt-8 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recommendations.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 sm:basis-1/2 lg:basis-1/3">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

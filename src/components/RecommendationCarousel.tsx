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
  );
};

export default RecommendationCarousel;
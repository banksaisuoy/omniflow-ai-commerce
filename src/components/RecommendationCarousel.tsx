import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getRecommendations } from '@/api/recommendations';

interface RecommendationCarouselProps {
  productId?: string;
  cartIds?: string[];
  title?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  productId,
  cartIds,
  title = 'You might also like',
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getRecommendations(productId, cartIds);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, cartIds]);

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading recommendations...</div>;
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="recommendation-carousel mt-8 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="-mx-2">
        <Slider {...settings}>
          {recommendations.map((product) => (
            <div key={product.id} className="px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default RecommendationCarousel;
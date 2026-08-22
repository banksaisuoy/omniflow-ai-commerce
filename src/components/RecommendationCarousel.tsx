  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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

  return (
    <div className="recommendation-carousel mt-8 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="px-12">
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
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default RecommendationCarousel;
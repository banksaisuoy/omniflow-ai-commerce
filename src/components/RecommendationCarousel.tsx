  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface RecommendationCarouselProps {
  productId?: string;
  title?: string;
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({ 
  productId, 
  title = "You Might Also Like" 
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await getRecommendations(productId, 5);
        setRecommendations(data || []);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recommendations.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4" />
          <CarouselNext className="-right-4" />
        </div>
      </Carousel>
    </div>
  );
};
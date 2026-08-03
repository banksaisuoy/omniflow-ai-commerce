  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, sortBy],
  });

  const filteredProducts = products?.filter(product =>
    (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    product.price <= maxPrice
  );

  return (
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">ราคาไม่เกิน ฿{maxPrice}</span>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-primary"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="เรียงตาม" />

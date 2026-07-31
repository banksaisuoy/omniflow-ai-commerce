  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, getTotalItems, orderNote, setOrderNote } = useCartStore();
  const { products: recentlyViewedProducts } = useRecentlyViewedStore();

  const filteredRecentlyViewed = recentlyViewedProducts.filter(
    (p) => !items.some((item) => item.id === p.id)
  );

  if (items.length === 0) {
    return (
      <Layout>
          </motion.div>
        </div>

        {filteredRecentlyViewed.length > 0 && (
          <div className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredRecentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as unknown as import('@/components/products/ProductCard').ProductCardProps['product']} />
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      {filteredRecentlyViewed.length > 0 && (
        <div className="container mx-auto px-4 py-16 border-t border-border mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredRecentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p as unknown as import('@/components/products/ProductCard').ProductCardProps['product']} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

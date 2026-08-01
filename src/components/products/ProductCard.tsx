    toast.success('เพิ่มลงตะกร้าแล้ว');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: flashSaleData ? flashSaleData.sale_price : product.price,
      thumbnail_url: product.thumbnail_url,
    });
    window.location.href = '/checkout';
  };

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <Button onClick={handleAddToCart} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                </Button>
                <Button variant="secondary" onClick={handleBuyNow} disabled={flashSaleData && flashSaleData.stock_limit > 0 && flashSaleData.sold_count >= flashSaleData.stock_limit}>
                  ซื้อเลย
                </Button>
              </div>
              {flashSaleData && flashSaleData.stock_limit > 0 && (
                <div className="w-full max-w-[120px] text-right">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
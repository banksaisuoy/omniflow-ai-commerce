            <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as unknown as { id: string; slug: string; name: string; price: number; compare_at_price: number | null; thumbnail_url: string | null; category: string | null; }} />
              ))}
            </div>
          </div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
                
                {getTotalPrice() < 500 && (
                  <div className="bg-muted p-3 rounded-lg text-sm text-center mb-6">
                    ซื้อเพิ่มอีก <span className="font-bold text-primary">฿{(500 - getTotalPrice()).toLocaleString()}</span> เพื่อรับสิทธิ์ส่งฟรี!
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ยอดรวมสินค้า ({getTotalItems()} ชิ้น)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ค่าจัดส่ง</span>
                    {getTotalPrice() >= 500 ? (
                      <span className="text-success">ฟรี</span>
                    ) : (
                      <span>฿50</span>
                    )}
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span className="text-primary">
                      ฿{(getTotalPrice() + (getTotalPrice() >= 500 ? 0 : 50)).toLocaleString()}
                    </span>
                  </div>
                </div>

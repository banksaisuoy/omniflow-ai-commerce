            <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as unknown as { id: string; [key: string]: unknown }} />
              ))}
            </div>
          </div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
                
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between text-sm mb-2">
                    {getTotalPrice() < 500 ? (
                      <span>ซื้ออีก <span className="font-bold text-primary">฿{(500 - getTotalPrice()).toLocaleString()}</span> ส่งฟรี</span>
                    ) : (
                      <span className="font-bold text-success">🎉 ได้รับสิทธิ์ส่งฟรี</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, (getTotalPrice() / 500) * 100)}%` }} />
                  </div>
                </div>

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
                    <span className="text-primary">฿{(getTotalPrice() + (getTotalPrice() >= 500 ? 0 : 50)).toLocaleString()}</span>
                  </div>
                </div>


        {items.length > 0 && (
          <div className="pt-4 border-t border-border/50 bg-background space-y-4">
            {getTotalPrice() < 500 && (
              <div className="bg-muted p-3 rounded-lg text-sm text-center">
                ซื้อเพิ่มอีก <span className="font-bold text-primary">฿{(500 - getTotalPrice()).toLocaleString()}</span> เพื่อรับสิทธิ์ส่งฟรี!
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ค่าจัดส่ง</span>
                {getTotalPrice() >= 500 ? (
                  <span className="text-success font-medium">ฟรี</span>
                ) : (
                  <span className="font-medium">฿50</span>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-primary">
                  ฿{(getTotalPrice() + (getTotalPrice() >= 500 ? 0 : 50)).toLocaleString()}
                </span>
              </div>
            </div>

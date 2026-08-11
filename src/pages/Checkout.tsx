  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

        _coupon_code: formData.couponCode?.trim() || null,
      });
      if (error) throw error;
      const order = data as unknown as { id: string };

      clearCart();
      toast.success('สร้างคำสั่งซื้อสำเร็จ');
      navigate('/order-success', { state: { orderId: order?.id } });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยอดรวมสินค้า</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าจัดส่ง</span>
                {shippingFee === 0 ? (
                  <span className="text-success">ฟรี</span>
                ) : (
                  <span>฿{shippingFee.toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="border-t border-border pt-4 font-bold flex justify-between">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-xl">฿{total.toLocaleString()}</span>
            </div>

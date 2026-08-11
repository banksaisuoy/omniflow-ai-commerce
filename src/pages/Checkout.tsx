
  const cartItemIds = items.map((i) => i.id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const finalTotal = total + (total >= 500 ? 0 : 50);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (paymentMethod !== 'promptpay' || finalTotal <= 0) {
      setQrCode(null);
      return;
    }
    let active = true;
    generatePromptPayQR(finalTotal)
      .then((url) => { if (active) setQrCode(url); })
      .catch(() => { if (active) setQrCode(null); });
    return () => { active = false; };
  }, [paymentMethod, finalTotal]);

  const onSubmit = async (formData: z.infer<typeof checkoutSchema>) => {
    setIsSubmitting(true);
      // Fraud Detection Check (Mocked data for demonstration)
      const fraudAnalysis = analyzeTransaction({
        userId: user?.id || null,
        amount: finalTotal,
        paymentMethod: paymentMethod,
        timestamp: Date.now()
      });
        _coupon_code: formData.couponCode?.trim() || null,
      });
      if (error) throw error;
      const order = data as unknown as { id: string };

      clearCart();
      toast.success('สร้างคำสั่งซื้อสำเร็จ');
      navigate('/order-success', { state: { orderId: order?.id } });
    } catch (error: unknown) {
      toast.error((error as Error).message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }

              {paymentMethod === 'promptpay' && (
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
                  <p className="font-medium">สแกนเพื่อชำระเงิน ฿{finalTotal.toLocaleString()}</p>
                  {qrCode ? (
                    <img src={qrCode} alt="PromptPay QR สำหรับชำระเงิน" className="w-56 h-56" />
                  ) : (
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                <span>ค่าจัดส่ง</span>
                {total >= 500 ? (
                  <span className="text-success">ฟรี</span>
                ) : (
                  <span>฿50</span>
                )}
              </div>
            </div>
            <div className="border-t border-border/50 pt-4 font-bold flex justify-between">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-xl">฿{finalTotal.toLocaleString()}</span>
            </div>
          </div>
          

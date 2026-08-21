  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotalPrice());
  const finalTotal = useCartStore((state) => state.getFinalTotal());
  const shippingFee = useCartStore((state) => state.getShippingFee());
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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

              {paymentMethod === 'promptpay' && (
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
                  <p className="font-medium">สแกนเพื่อชำระเงิน ฿{finalTotal.toLocaleString()}</p>
                  {qrCode ? (
                    <img src={qrCode} alt="PromptPay QR สำหรับชำระเงิน" className="w-56 h-56" />
                  ) : (
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                <span>ค่าจัดส่ง</span>
                <span className={shippingFee === 0 ? "text-success" : ""}>
                  {shippingFee === 0 ? "ฟรี" : `฿${shippingFee.toLocaleString()}`}
                </span>
              </div>
            </div>
            <div className="border-t pt-4 font-bold flex justify-between">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-xl">฿{finalTotal.toLocaleString()}</span>
            </div>
          </div>
          

  const updateMutation = useMutation({
    mutationFn: async (product: any) => {
      if (!product.name || product.name.trim() === '') {
        throw new Error('กรุณากรอกชื่อสินค้า');
      }
      if (typeof product.price !== 'number' || isNaN(product.price) || product.price < 0) {
        throw new Error('ราคาสินค้าต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
      }

      const { error } = await supabase.from('products').update({
        name: product.name.trim(),
        price: product.price,
        status: product.status,
        category: product.category,
      setIsDialogOpen(false);
      toast.success('อัปเดตสินค้าแล้ว');
    },
    onError: (error: any) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    },
  });

  const filtered = products?.filter(p =>

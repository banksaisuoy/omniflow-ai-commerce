        throw new Error('ราคาสินค้าต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
      }

      const sanitizedName = product.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
      const sanitizedCategory = product.category ? product.category.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim() : null;

      const { error } = await supabase.from('products').update({
        name: sanitizedName,
        price: product.price,
        status: product.status,
        category: sanitizedCategory,
      });

      if (error) throw error;
      setIsDialogOpen(false);
      toast.success('อัปเดตสินค้าแล้ว');
    },

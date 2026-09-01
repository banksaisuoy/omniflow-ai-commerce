        throw new Error('ราคาสินค้าต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
      }

      // React JSX auto-escapes HTML variables, preventing XSS without manual entity replacement.
      // And supabase auto parameterizes inputs.
      const sanitizedName = product.name.trim();
      const sanitizedCategory = product.category ? product.category.trim() : null;

      const { error } = await supabase.from('products').update({
        name: sanitizedName,
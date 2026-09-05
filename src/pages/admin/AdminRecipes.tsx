    const sanitizedNotes = form.notes ? form.notes.trim() : null;
    form.notes = sanitizedNotes as any;

    try {
      const z = (await import('zod')).z;
      const recipeSchema = z.object({
        product_id: z.string().min(1, 'ต้องเลือกสินค้า'),
        name: z.string().min(1, 'ชื่อสูตรต้องไม่เป็นค่าว่าง').max(100, 'ชื่อสูตรยาวเกินไป (สูงสุด 100 ตัวอักษร)'),
        notes: z.string().max(500, 'หมายเหตุยาวเกินไป (สูงสุด 500 ตัวอักษร)').nullable().optional()
      });
      recipeSchema.parse(form);
    } catch (err: any) {
      if (err.errors) {
        return toast.error(err.errors[0].message);
      }
      return toast.error('ข้อมูลไม่ถูกต้อง');
    }

    const { error } = await supabase.from('recipes' as any).insert(form as any);
  };


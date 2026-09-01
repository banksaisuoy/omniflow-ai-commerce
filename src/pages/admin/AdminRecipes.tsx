  const create = async () => {
    if (!form.product_id || !form.name) return toast.error('เลือกสินค้าและตั้งชื่อสูตร');
    
    // React JSX auto-escapes HTML variables, preventing XSS without manual entity replacement.
    // And supabase auto parameterizes inputs.
    const sanitizedNotes = form.notes ? form.notes.trim() : null;
    form.notes = sanitizedNotes as any;

    const { error } = await supabase.from('recipes' as any).insert(form as any);
  };

  const updateItem = async (id: string, patch: Partial<RecipeItem>) => {
    if (patch.ingredient_name) patch.ingredient_name = patch.ingredient_name.trim();
    if (patch.unit) patch.unit = patch.unit.trim();
    const { error } = await supabase.from('recipe_items' as any).update(patch as any).eq('id', id);
    if (error) return toast.error(error.message);
  };
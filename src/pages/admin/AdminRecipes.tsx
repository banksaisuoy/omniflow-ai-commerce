  const create = async () => {
    if (!form.product_id || !form.name) return toast.error('เลือกสินค้าและตั้งชื่อสูตร');
    
    const sanitizedNotes = form.notes ? form.notes.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim() : null;
    form.notes = sanitizedNotes as any;

    const { error } = await supabase.from('recipes' as any).insert(form as any);
  };

  const updateItem = async (id: string, patch: Partial<RecipeItem>) => {
    if (patch.ingredient_name) patch.ingredient_name = patch.ingredient_name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    if (patch.unit) patch.unit = patch.unit.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    const { error } = await supabase.from('recipe_items' as any).update(patch as any).eq('id', id);
    if (error) return toast.error(error.message);
  };
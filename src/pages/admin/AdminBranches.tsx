    setSaving(true);
    
    // Sanitize input to prevent XSS
    const sanitizedName = form.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    const sanitizedCode = form.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    
    const { error } = await supabase.from('branches' as any).insert({ ...form, name: sanitizedName, code: sanitizedCode } as any);
    setSaving(false);
    setSaving(true);
    
    // React JSX auto-escapes HTML variables, preventing XSS without manual entity replacement.
    // And supabase auto parameterizes inputs.
    const sanitizedName = form.name.trim();
    const sanitizedCode = form.code.trim();
    
    const { error } = await supabase.from('branches' as any).insert({ ...form, name: sanitizedName, code: sanitizedCode } as any);
    setSaving(false);
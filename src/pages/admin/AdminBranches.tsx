  const create = async () => {
    if (!form.name.trim() || !form.code.trim()) return toast.error('กรอกชื่อและรหัสสาขา');
    setSaving(true);
    
    // Sanitize input to prevent XSS
    const sanitizedName = form.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    const sanitizedCode = form.code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    
    const { error } = await supabase.from('branches' as any).insert({ ...form, name: sanitizedName, code: sanitizedCode } as any);
    setSaving(false);

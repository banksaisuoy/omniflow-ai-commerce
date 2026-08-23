  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim() || !form.code.trim()) return toast.error('กรอกชื่อและรหัสสาขา');
    setSaving(true);
    const { error } = await supabase.from('branches' as any).insert(form as any);
    setSaving(false);

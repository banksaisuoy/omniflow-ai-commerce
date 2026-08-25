
  if (!loading && !user) return <Navigate to="/auth" replace />;

  // Sanitize function to prevent XSS
  const sanitizeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  };

  const handleCreate = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: sanitizeHtml(recipient.name),
      _recipient_email: recipient.email ? sanitizeHtml(recipient.email) : null,
      _message: recipient.message ? sanitizeHtml(recipient.message) : null,
    });
    setBusy(false);
    if (error) {

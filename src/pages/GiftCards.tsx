    message: z.string().max(1000).nullable().optional()
  });

  const handleCreate = async () => {
    setBusy(true);
    let validatedRecipient;
    try {
      validatedRecipient = giftCardSchema.parse({
        name: recipient.name,
        email: recipient.email || null,
        message: recipient.message || null
      });
    } catch (e: any) {
      setBusy(false);
      const errorMessage = e?.errors?.[0]?.message || 'Invalid input';
      toast.error(errorMessage);
      return;
    }

    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: validatedRecipient.name,
      _recipient_email: validatedRecipient.email || null,
      _message: validatedRecipient.message || null
    });
    setBusy(false);
    if (error) {

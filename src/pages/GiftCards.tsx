    message: z.string().max(1000).nullable().optional()
  });

  const handleCreate = async () => {
    setBusy(true);
    let validatedRecipient;
    try {
      validatedRecipient = giftCardSchema.parse(recipient);
    } catch (e: any) {
      setBusy(false);
      toast.error(e.errors[0].message);
      return;
    }

    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: validatedRecipient.name,
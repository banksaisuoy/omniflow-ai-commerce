      return;
    }

    const sanitizedName = validatedRecipient.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    const sanitizedEmail = validatedRecipient.email ? validatedRecipient.email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim() : null;
    const sanitizedMessage = validatedRecipient.message ? validatedRecipient.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim() : null;

    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: sanitizedName,
      _recipient_email: sanitizedEmail,
      _message: sanitizedMessage
    });
    setBusy(false);
    if (error) {

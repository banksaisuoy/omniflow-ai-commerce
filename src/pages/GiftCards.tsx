      return;
    }

    // JSX automatically escapes variables passed to components, and Supabase RPC parameterizes inputs
    // Therefore, manual HTML entity encoding is not required here and could lead to double-escaping in DB.
    // Rely on Zod input validation via validatedRecipient schema.
    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: validatedRecipient.name.trim(),
      _recipient_email: validatedRecipient.email ? validatedRecipient.email.trim() : null,
      _message: validatedRecipient.message ? validatedRecipient.message.trim() : null
    });
    setBusy(false);
    if (error) {
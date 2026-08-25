import { z } from 'zod';

  if (!loading && !user) return <Navigate to="/auth" replace />;

  // Schema definition for GiftCard form values
  const giftCardSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email address').nullable().optional(),
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
    } catch (e) {
      setBusy(false);
      toast.error(e.errors[0].message);
      return;
    }
    
    const { data, error } = await supabase.rpc('admin_create_gift_card', {
      _amount: amount,
      _recipient_name: validatedRecipient.name,
      _recipient_email: validatedRecipient.email,
      _message: validatedRecipient.message,
    });
    setBusy(false);
    if (error) {

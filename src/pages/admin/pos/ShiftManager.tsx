    if (!amt || amt <= 0) return toast.error('ระบุจำนวนเงิน');

    // Sanitize reason to prevent XSS if reason is rendered elsewhere in the application
    const sanitizedReason = moveReason ? moveReason.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim() : null;
    if (sanitizedReason && sanitizedReason.length > 255) return toast.error('เหตุผลยาวเกินไป (สูงสุด 255 ตัวอักษร)');

    const { error } = await (supabase as any).from('pos_cash_movements').insert({

    if (!shift) return;
    const amt = parseFloat(moveAmount);
    if (!amt || amt <= 0) return toast.error('ระบุจำนวนเงิน');

    // Sanitize reason to prevent XSS if reason is rendered elsewhere in the application
    const sanitizedReason = moveReason ? moveReason.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim() : null;
    if (sanitizedReason && sanitizedReason.length > 255) return toast.error('เหตุผลยาวเกินไป (สูงสุด 255 ตัวอักษร)');

    const { error } = await (supabase as any).from('pos_cash_movements').insert({
      shift_id: shift.id,
      movement_type: type,
      amount: amt,
      reason: sanitizedReason || null,
      created_by: shift.cashier_id,
    });
    if (error) return toast.error(error.message);

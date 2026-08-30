import { z } from 'zod';
import DOMPurify from 'dompurify';

const cashMovementReasonSchema = z.string().max(255, 'เหตุผลยาวเกินไป (สูงสุด 255 ตัวอักษร)');
    if (!amt || amt <= 0) return toast.error('ระบุจำนวนเงิน');

    // Sanitize reason to prevent XSS if reason is rendered elsewhere in the application
    let sanitizedReason = null;
    try {
      if (moveReason) {
        const validated = cashMovementReasonSchema.parse(moveReason);
        sanitizedReason = DOMPurify.sanitize(validated.trim());
      }
    } catch (err: any) {
      return toast.error(err.errors[0].message);
    }

    const { error } = await (supabase as any).from('pos_cash_movements').insert({

import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const orderSchema = z.string().min(3, 'หมายเลขคำสั่งซื้อสั้นเกินไป').max(50, 'หมายเลขคำสั่งซื้อยาวเกินไป').regex(/^[A-Za-z0-9-]+$/, 'หมายเลขคำสั่งซื้อมีตัวอักษรที่ไม่ถูกต้อง');

const STATUS_STEPS = [
  { key: 'pending', label: 'รับคำสั่งซื้อ', icon: Clock },
  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;
    
    const parsed = orderSchema.safeParse(orderNumber.trim());
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    setParams({ order: orderNumber });
    try {

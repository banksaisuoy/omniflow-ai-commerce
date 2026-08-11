import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">หมายเลขคำสั่งซื้อ</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-2xl font-mono font-bold text-primary">
                    {order.order_number}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(order.order_number);
                      toast.success('คัดลอกหมายเลขคำสั่งซื้อแล้ว');
                    }}
                    title="คัดลอกหมายเลขคำสั่งซื้อ"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สถานะ</span>
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle2, Clock, Truck, Home, Copy } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">หมายเลข</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg">{order.order_number}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(order.order_number);
                        toast.success('คัดลอกหมายเลขคำสั่งซื้อแล้ว');
                      }}
                      title="คัดลอกหมายเลขคำสั่งซื้อ"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ยอดรวม</p>

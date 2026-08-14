import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, RefreshCw } from 'lucide-react';

interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number | null;
  product: {
    name: string;
    sku: string | null;
  } | null;
}

export default function AdminInventory() {
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          product_id,
          quantity,
          low_stock_threshold,
          product:products (
            name,
            sku
          )
        `)
        .order('quantity', { ascending: true });

      if (error) throw error;
      
      // Need to typecast or map the data since Supabase types might differ slightly
      return data as unknown as InventoryItem[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Sync Monitoring</h2>
          <p className="text-muted-foreground mt-1">
            Real-time tracking of product stock levels
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory?.map((item) => {
                    const threshold = item.low_stock_threshold || 5;
                    let statusColor = "bg-green-100 text-green-800";
                    let statusText = "In Stock";

                    if (item.quantity <= 0) {
                      statusColor = "bg-red-100 text-red-800";
                      statusText = "Out of Stock";
                    } else if (item.quantity <= threshold) {
                      statusColor = "bg-orange-100 text-orange-800";
                      statusText = "Low Stock";
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell>{item.product?.sku || '-'}</TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor}>
                            {statusText}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!inventory || inventory.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No inventory data found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

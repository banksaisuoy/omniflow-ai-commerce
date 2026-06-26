import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Txn {
  id: string;
  receipt_no: string;
  total: number;
  status: string;
  created_at: string;
  pos_payments?: { method: string; amount: number }[];
}

export default function POSTransactions() {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from('pos_transactions')
        .select('id, receipt_no, total, status, created_at, pos_payments(method,amount)')
        .order('created_at', { ascending: false })
        .limit(100);
      setTxns((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">บิล POS ล่าสุด</h1>
        <p className="text-muted-foreground mt-1">100 รายการล่าสุด</p>
      </div>
      <Card>
        <CardHeader><CardTitle>รายการขาย</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่บิล</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ชำระโดย</TableHead>
                  <TableHead className="text-right">ยอด</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.receipt_no}</TableCell>
                    <TableCell className="text-sm">{new Date(t.created_at).toLocaleString('th-TH')}</TableCell>
                    <TableCell className="text-sm">
                      {(t.pos_payments ?? []).map((p) => p.method).join(', ') || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">฿{Number(t.total).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'paid' ? 'default' : 'destructive'}>{t.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {txns.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">ยังไม่มีบิล</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

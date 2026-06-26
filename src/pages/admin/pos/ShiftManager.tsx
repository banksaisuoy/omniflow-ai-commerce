import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { usePOSShift } from '@/hooks/usePOSShift';
import { supabase } from '@/integrations/supabase/client';
import { ArrowDownCircle, ArrowUpCircle, Banknote, ClipboardList, Lock, Unlock } from 'lucide-react';

export default function ShiftManager() {
  const { shift, loading, openShift, closeShift, refresh } = usePOSShift();
  const [openingCash, setOpeningCash] = useState('1000');
  const [actualCash, setActualCash] = useState('');
  const [moveAmount, setMoveAmount] = useState('');
  const [moveReason, setMoveReason] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [summary, setSummary] = useState<{ cashSales: number; movements: number; expected: number } | null>(null);

  useEffect(() => {
    if (!shift) {
      setSummary(null);
      return;
    }
    (async () => {
      const { data: txns } = await (supabase as any)
        .from('pos_transactions')
        .select('id, status, pos_payments(method,amount,change_amount)')
        .eq('shift_id', shift.id);
      let cashSales = 0;
      (txns ?? []).forEach((t: any) => {
        if (t.status !== 'paid') return;
        (t.pos_payments ?? []).forEach((p: any) => {
          if (p.method === 'cash') cashSales += Number(p.amount) - Number(p.change_amount ?? 0);
        });
      });
      const { data: moves } = await (supabase as any)
        .from('pos_cash_movements')
        .select('movement_type, amount')
        .eq('shift_id', shift.id);
      const movements = (moves ?? []).reduce(
        (s: number, m: any) => s + (m.movement_type === 'in' ? Number(m.amount) : -Number(m.amount)),
        0
      );
      setSummary({
        cashSales,
        movements,
        expected: Number(shift.opening_cash) + cashSales + movements,
      });
    })();
  }, [shift]);

  const handleOpen = async () => {
    try {
      await openShift(parseFloat(openingCash || '0'));
      toast.success('เปิดกะเรียบร้อย');
    } catch (e: any) {
      toast.error(e.message ?? 'เปิดกะไม่สำเร็จ');
    }
  };

  const handleCashMove = async (type: 'in' | 'out') => {
    if (!shift) return;
    const amt = parseFloat(moveAmount);
    if (!amt || amt <= 0) return toast.error('ระบุจำนวนเงิน');
    const { error } = await (supabase as any).from('pos_cash_movements').insert({
      shift_id: shift.id,
      movement_type: type,
      amount: amt,
      reason: moveReason || null,
      created_by: shift.cashier_id,
    });
    if (error) return toast.error(error.message);
    toast.success(type === 'in' ? 'บันทึกเงินเข้า' : 'บันทึกเงินออก');
    setMoveAmount('');
    setMoveReason('');
    refresh();
  };

  const handleClose = async () => {
    if (!shift) return;
    const actual = parseFloat(actualCash);
    if (Number.isNaN(actual)) return toast.error('ระบุยอดเงินสดจริง');
    try {
      const res = await closeShift(actual, closeNotes);
      toast.success(`ปิดกะแล้ว ส่วนต่าง ฿${res.variance.toFixed(2)}`);
      setActualCash('');
      setCloseNotes('');
    } catch (e: any) {
      toast.error(e.message ?? 'ปิดกะไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold gradient-text">จัดการกะ (Shift)</h1>
        <p className="text-muted-foreground mt-1">เปิด/ปิดกะ บันทึกเงินเข้า-ออกลิ้นชัก และคำนวณส่วนต่าง</p>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">กำลังโหลด...</CardContent></Card>
      ) : !shift ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Unlock className="h-5 w-5" /> เปิดกะใหม่</CardTitle>
            <CardDescription>ระบุยอดเงินสดในลิ้นชักเมื่อเริ่มกะ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>เงินสดเริ่มต้น (฿)</Label>
              <Input type="number" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
            </div>
            <Button size="lg" onClick={handleOpen} className="gap-2">
              <Unlock className="h-4 w-4" /> เปิดกะ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="glass border-success/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>กะที่กำลังเปิด</CardTitle>
                <CardDescription>เริ่มเมื่อ {new Date(shift.opened_at).toLocaleString('th-TH')}</CardDescription>
              </div>
              <Badge className="bg-success text-success-foreground">เปิดอยู่</Badge>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-4 gap-4 text-sm">
              <Stat label="เงินสดต้นกะ" value={`฿${Number(shift.opening_cash).toLocaleString()}`} />
              <Stat label="ขายสด" value={summary ? `฿${summary.cashSales.toLocaleString()}` : '...'} />
              <Stat label="เงินเข้า/ออก" value={summary ? `฿${summary.movements.toLocaleString()}` : '...'} />
              <Stat label="คาดว่าควรมี" value={summary ? `฿${summary.expected.toLocaleString()}` : '...'} highlight />
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> เงินเข้า/ออกลิ้นชัก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input type="number" placeholder="จำนวนเงิน" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} />
                <Input placeholder="เหตุผล (ทอนเงิน / ฝากธนาคาร ฯลฯ)" value={moveReason} onChange={(e) => setMoveReason(e.target.value)} className="sm:col-span-2" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCashMove('in')} className="gap-2">
                  <ArrowDownCircle className="h-4 w-4" /> เงินเข้า
                </Button>
                <Button variant="outline" onClick={() => handleCashMove('out')} className="gap-2">
                  <ArrowUpCircle className="h-4 w-4" /> เงินออก
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> ปิดกะ (Z-Report)</CardTitle>
              <CardDescription>นับเงินสดจริงในลิ้นชัก ระบบจะคำนวณส่วนต่างให้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>เงินสดจริง (฿)</Label>
                  <Input type="number" value={actualCash} onChange={(e) => setActualCash(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>หมายเหตุ</Label>
                  <Textarea value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} rows={1} />
                </div>
              </div>
              <Button variant="destructive" onClick={handleClose} className="gap-2">
                <ClipboardList className="h-4 w-4" /> ปิดกะ
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>{value}</div>
    </div>
  );
}

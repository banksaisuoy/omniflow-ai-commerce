import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Minus, Plus, Search, Trash2, Receipt, CreditCard, Banknote, QrCode, Wallet, X } from 'lucide-react';
import { usePOSStore } from '@/stores/posStore';
import { usePOSShift } from '@/hooks/usePOSShift';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string | null;
  category_id: string | null;
  sku: string | null;
}
interface Category { id: string; name: string; }

export default function POS() {
  const { shift, loading: shiftLoading } = usePOSShift();
  const cart = usePOSStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<'cash' | 'promptpay' | 'card' | 'ewallet'>('cash');
  const [received, setReceived] = useState('');
  const [refNo, setRefNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{ receipt_no: string; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: prods } = await supabase
        .from('products')
        .select('id,name,price,thumbnail_url,category_id,sku')
        .eq('status', 'active')
        .order('name');
      setProducts((prods as any) ?? []);
      const { data: cats } = await supabase.from('categories').select('id,name').order('name');
      setCategories((cats as any) ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== 'all' && p.category_id !== selectedCat) return false;
      if (search && !`${p.name} ${p.sku ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, selectedCat, search]);

  const subtotal = cart.subtotal();
  const total = cart.total();
  const change = method === 'cash' ? Math.max(0, parseFloat(received || '0') - total) : 0;

  const onCheckout = async () => {
    if (!shift) return toast.error('กรุณาเปิดกะก่อนทำรายการ');
    if (cart.items.length === 0) return toast.error('ตะกร้าว่าง');
    setSubmitting(true);
    const payAmount = method === 'cash' ? parseFloat(received || '0') : total;
    try {
      const { data, error } = await (supabase as any).rpc('pos_checkout', {
        _items: cart.items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          unit_price: i.unit_price,
          qty: i.qty,
          line_discount: i.line_discount,
        })),
        _payments: [
          {
            method,
            amount: payAmount,
            ref_no: refNo || null,
            change_amount: change,
          },
        ],
        _discount_total: cart.discountTotal,
        _vat_rate: 0,
        _customer_id: null,
        _notes: cart.notes || null,
      });
      if (error) throw error;
      setLastReceipt({ receipt_no: data.receipt_no, total: data.total });
      cart.clear();
      setReceived('');
      setRefNo('');
      setPayOpen(false);
      toast.success(`ออกบิลแล้ว: ${data.receipt_no}`);
    } catch (e: any) {
      toast.error(e.message ?? 'ชำระเงินไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (shiftLoading) return <div className="p-6 text-muted-foreground">กำลังโหลด...</div>;
  if (!shift) {
    return (
      <Card className="p-10 text-center space-y-4">
        <div className="text-xl font-semibold">ยังไม่มีกะที่เปิดอยู่</div>
        <p className="text-muted-foreground">เปิดกะก่อนเริ่มขายหน้าร้าน</p>
        <Link to="/admin/pos/shift"><Button size="lg">ไปหน้าเปิดกะ</Button></Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 h-[calc(100vh-9rem)]">
      {/* Product grid */}
      <div className="flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อสินค้า / SKU / สแกนบาร์โค้ด"
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <Tabs value={selectedCat} onValueChange={setSelectedCat} className="mb-3">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ScrollArea className="flex-1 -mr-2 pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  cart.addItem({
                    product_id: p.id,
                    name: p.name,
                    unit_price: Number(p.price),
                    thumbnail_url: p.thumbnail_url,
                  })
                }
                className="group rounded-2xl border bg-card hover:border-primary hover:shadow-soft transition-all overflow-hidden text-left"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍡</div>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                  <div className="mt-1 text-primary font-semibold">฿{Number(p.price).toLocaleString()}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">ไม่พบสินค้า</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Cart */}
      <Card className="flex flex-col min-h-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">บิลปัจจุบัน</div>
            <div className="text-xs text-muted-foreground">กะ #{shift.id.slice(0, 8)}</div>
          </div>
          {cart.items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={cart.clear} className="text-destructive">
              <X className="h-4 w-4 mr-1" /> ล้าง
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {cart.items.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">ยังไม่มีสินค้าในบิล</div>
            ) : (
              cart.items.map((i) => (
                <div key={i.product_id} className="flex items-center gap-2 p-2 rounded-xl border bg-background">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{i.name}</div>
                    <div className="text-xs text-muted-foreground">฿{i.unit_price.toLocaleString()} × {i.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(i.product_id!, i.qty - 1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(i.product_id!, i.qty + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cart.removeItem(i.product_id!)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs flex-1">ส่วนลดท้ายบิล</Label>
            <Input
              type="number"
              value={cart.discountTotal || ''}
              onChange={(e) => cart.setDiscountTotal(parseFloat(e.target.value || '0'))}
              className="h-8 w-28 text-right"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>ยอดรวม</span><span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>สุทธิ</span><span className="text-primary">฿{total.toLocaleString()}</span>
          </div>
          <Button
            size="lg"
            className="w-full h-12 text-base gap-2"
            disabled={cart.items.length === 0}
            onClick={() => { setReceived(total.toString()); setPayOpen(true); }}
          >
            <Receipt className="h-5 w-5" /> ชำระเงิน
          </Button>
          {lastReceipt && (
            <div className="text-xs text-center text-success">
              ✓ บิลล่าสุด: {lastReceipt.receipt_no} (฿{lastReceipt.total.toLocaleString()})
            </div>
          )}
        </div>
      </Card>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ชำระเงิน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-3 rounded-xl bg-primary/10">
              <div className="text-xs text-muted-foreground">ยอดต้องชำระ</div>
              <div className="text-3xl font-bold text-primary">฿{total.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <Label>วิธีชำระเงิน</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: 'cash', label: 'เงินสด', icon: Banknote },
                  { v: 'promptpay', label: 'PromptPay', icon: QrCode },
                  { v: 'card', label: 'บัตร', icon: CreditCard },
                  { v: 'ewallet', label: 'E-Wallet', icon: Wallet },
                ].map((m) => (
                  <button
                    key={m.v}
                    onClick={() => setMethod(m.v as any)}
                    className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1 transition ${
                      method === m.v ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <m.icon className="h-5 w-5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            {method === 'cash' ? (
              <div className="space-y-2">
                <Label>รับเงินสด (฿)</Label>
                <Input type="number" value={received} onChange={(e) => setReceived(e.target.value)} className="h-12 text-xl" />
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, total].map((q, idx) => (
                    <Button key={idx} variant="outline" size="sm" onClick={() => setReceived(String(q))}>
                      ฿{q.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span>เงินทอน</span>
                  <span className="font-semibold text-success">฿{change.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>เลขอ้างอิง / Ref No.</Label>
                <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="เลข Slip / Approval Code" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>ยกเลิก</Button>
            <Button onClick={onCheckout} disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันชำระเงิน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

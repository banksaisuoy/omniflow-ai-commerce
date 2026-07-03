import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Gift, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const AMOUNTS = [200, 500, 1000, 2000];

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint32Array(12);
  crypto.getRandomValues(randomValues);

  return 'GC-' + Array.from({ length: 12 }, (_, i) => chars[randomValues[i] % chars.length]).join('');
}

export default function GiftCards() {
  const { user, loading } = useAuth();
  const [amount, setAmount] = useState(500);
  const [recipient, setRecipient] = useState({ name: '', email: '', message: '' });
  const [created, setCreated] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const handleCreate = async () => {
    setBusy(true);
    const code = genCode();
    const { data, error } = await supabase.from('gift_cards').insert({
      code,
      initial_amount: amount,
      balance: amount,
      sender_id: user!.id,
      sender_email: user!.email,
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      message: recipient.message,
    }).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setCreated(data);
    toast.success('🎁 สร้างบัตรของขวัญเรียบร้อย!');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <Gift className="h-12 w-12 mx-auto text-primary mb-3" />
          <h1 className="font-display text-4xl mb-2">e-Gift Card</h1>
          <p className="text-muted-foreground">ส่งความหวานให้คนพิเศษของคุณ</p>
        </div>

        {created ? (
          <Card className="rounded-3xl bg-gradient-primary text-white">
            <CardContent className="p-8 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4" />
              <div className="text-sm opacity-80">มูลค่า</div>
              <div className="font-display text-5xl mb-4">฿{Number(created.initial_amount).toLocaleString()}</div>
              <div className="text-sm opacity-80 mb-2">รหัสบัตรของขวัญ</div>
              <div className="flex items-center justify-center gap-2 bg-white/20 rounded-xl px-4 py-3 font-mono text-lg mb-6">
                {created.code}
                <button onClick={() => { navigator.clipboard.writeText(created.code); setCopied(true); }}>
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <Button variant="secondary" onClick={() => setCreated(null)}>สร้างใบใหม่</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl">
            <CardHeader><CardTitle>เลือกมูลค่า</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-3">
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={`p-4 rounded-2xl border-2 transition-all font-display text-xl ${amount === a ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    ฿{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <div>
                <Label>ชื่อผู้รับ</Label>
                <Input value={recipient.name} onChange={e => setRecipient({ ...recipient, name: e.target.value })} placeholder="เช่น คุณแม่" />
              </div>
              <div>
                <Label>อีเมลผู้รับ (ถ้ามี)</Label>
                <Input type="email" value={recipient.email} onChange={e => setRecipient({ ...recipient, email: e.target.value })} />
              </div>
              <div>
                <Label>ข้อความอวยพร</Label>
                <Textarea value={recipient.message} onChange={e => setRecipient({ ...recipient, message: e.target.value })} placeholder="สุขสันต์วันเกิดค่ะ..." />
              </div>
              <Button onClick={handleCreate} disabled={busy || !recipient.name} className="w-full h-12 rounded-full">
                {busy ? 'กำลังสร้าง...' : `สร้างบัตร ฿${amount.toLocaleString()}`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function Referral() {
  const { user, loading } = useAuth();
  const [code, setCode] = useState<string>('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false });
      if (data && data.length) setCode(data[0].code);
      else {
        const newCode = 'KHM-' + user.id.slice(0, 6).toUpperCase();
        const { data: created } = await supabase.from('referrals').insert({ referrer_id: user.id, code: newCode }).select().single();
        if (created) setCode(created.code);
      }
      setReferrals(data ?? []);
    })();
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const link = `${window.location.origin}/auth?ref=${code}`;
  const completed = referrals.filter(r => r.status === 'completed').length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <Users className="h-12 w-12 mx-auto text-primary mb-3" />
          <h1 className="font-display text-4xl mb-2">ชวนเพื่อน รับ 200 แต้ม</h1>
          <p className="text-muted-foreground">ทั้งคุณและเพื่อนจะได้แต้มทั้งคู่</p>
        </div>

        <Card className="rounded-3xl bg-gradient-primary text-white mb-6">
          <CardContent className="p-8 text-center">
            <div className="text-sm opacity-80 mb-2">โค้ดชวนเพื่อนของคุณ</div>
            <div className="font-display text-4xl mb-4">{code}</div>
            <div className="flex items-center justify-center gap-2 bg-white/20 rounded-xl px-4 py-3 text-sm mb-4 break-all">
              {link}
              <button onClick={() => { navigator.clipboard.writeText(link); setCopied(true); toast.success('คัดลอกแล้ว!'); }}>
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <Button variant="secondary" onClick={() => navigator.share?.({ title: 'Khanom House', text: 'มาลองขนมไทยกันสิ!', url: link })}>
              แชร์ให้เพื่อน
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> เพื่อนที่ชวนมา ({completed} คนเสร็จ)</CardTitle></CardHeader>
          <CardContent>
            {referrals.length === 0 ? <p className="text-center text-muted-foreground py-6">ยังไม่มีเพื่อนใช้โค้ด</p> : (
              <div className="space-y-2">
                {referrals.map(r => (
                  <div key={r.id} className="flex justify-between p-3 rounded-xl bg-muted/50">
                    <div className="text-sm">{new Date(r.created_at).toLocaleDateString('th-TH')}</div>
                    <div className={`text-sm font-medium ${r.status === 'completed' ? 'text-success' : 'text-muted-foreground'}`}>
                      {r.status === 'completed' ? `+${r.reward_points} แต้ม` : 'รอเพื่อนซื้อครั้งแรก'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

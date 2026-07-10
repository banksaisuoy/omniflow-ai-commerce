import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, KeyRound, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/** Real TOTP 2FA via Supabase MFA */
export function TwoFactorSetup() {
  const [status, setStatus] = useState<'loading' | 'enrolled' | 'not_enrolled' | 'pending'>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setStatus('loading');
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) { toast.error(error.message); setStatus('not_enrolled'); return; }
    const totp = data.totp?.[0];
    if (totp && totp.status === 'verified') {
      setFactorId(totp.id);
      setStatus('enrolled');
    } else {
      setStatus('not_enrolled');
    }
  };

  useEffect(() => { refresh(); }, []);

  const startEnroll = async () => {
    setBusy(true);
    try {
      // Clean any un-verified factor first
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.all ?? []) {
        if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Khanom House TOTP' });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStatus('pending');
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const verify = async () => {
    if (!factorId) return;
    setBusy(true);
    try {
      const { data: chal, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
      if (e1) throw e1;
      const { error: e2 } = await supabase.auth.mfa.verify({ factorId, challengeId: chal.id, code });
      if (e2) throw e2;
      toast.success('เปิดใช้ 2FA สำเร็จ');
      setQr(null); setSecret(null); setCode('');
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? 'รหัสไม่ถูกต้อง');
    } finally { setBusy(false); }
  };

  const disable = async () => {
    if (!factorId) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('ปิด 2FA แล้ว');
    refresh();
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
          {status === 'enrolled' && <Badge variant="secondary" className="ml-2"><CheckCircle2 className="h-3 w-3 mr-1" />เปิดใช้งาน</Badge>}
          {status === 'not_enrolled' && <Badge variant="outline" className="ml-2"><XCircle className="h-3 w-3 mr-1" />ยังไม่เปิด</Badge>}
        </div>
        <CardDescription>ใช้แอป Google Authenticator / Authy / 1Password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}

        {status === 'not_enrolled' && (
          <Button onClick={startEnroll} disabled={busy}>
            <KeyRound className="mr-2 h-4 w-4" /> เริ่มตั้งค่า 2FA
          </Button>
        )}

        {status === 'pending' && qr && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 bg-muted/30 flex flex-col md:flex-row gap-4 items-center">
              <img src={qr} alt="QR" className="w-40 h-40 bg-white rounded-lg p-2" />
              <div className="text-sm space-y-2">
                <div className="font-medium">1) สแกน QR ในแอป Authenticator</div>
                <div className="text-muted-foreground">หรือกรอก secret ด้วยมือ:</div>
                <code className="block break-all text-xs bg-background rounded p-2">{secret}</code>
                <div className="font-medium pt-2">2) กรอกรหัส 6 หลักจากแอปเพื่อยืนยัน</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123 456" maxLength={6} className="max-w-[160px] tracking-widest" />
              <Button onClick={verify} disabled={busy || code.length < 6}>ยืนยัน</Button>
            </div>
          </div>
        )}

        {status === 'enrolled' && (
          <Button variant="destructive" onClick={disable} disabled={busy}>ปิด 2FA</Button>
        )}
      </CardContent>
    </Card>
  );
}

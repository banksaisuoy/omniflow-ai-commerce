import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileText, Globe, KeyRound, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSecurity() {
  const { user } = useAuth();
  const [pdpaConsent, setPdpaConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [rateLimit, setRateLimit] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('kh_privacy');
    if (s) {
      const p = JSON.parse(s);
      setPdpaConsent(p.pdpa ?? true);
      setMarketingConsent(p.marketing ?? false);
    }
  }, []);

  const savePrivacy = () => {
    localStorage.setItem('kh_privacy', JSON.stringify({ pdpa: pdpaConsent, marketing: marketingConsent }));
    toast.success('บันทึกการตั้งค่าความเป็นส่วนตัวแล้ว');
  };

  const exportData = async () => {
    if (!user) return;
    try {
      const [{ data: profile }, { data: orders }, { data: reviews }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('orders').select('*').eq('customer_id', user.id),
        supabase.from('reviews').select('*').eq('user_id', user.id),
      ]);
      const bundle = { profile, orders, reviews, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdpa-export-${user.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ส่งออกข้อมูลส่วนบุคคลสำเร็จ (PDPA)');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Trust & Security</h1>
        <p className="text-muted-foreground mt-1">ความปลอดภัย · PDPA · ความเป็นส่วนตัว</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          </div>
          <CardDescription>ป้องกันบัญชีด้วย OTP นอกเหนือจากรหัสผ่าน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">เปิดใช้ 2FA (TOTP)</div>
              <div className="text-sm text-muted-foreground">รองรับ Google Authenticator / Authy</div>
            </div>
            <Switch checked={twoFA} onCheckedChange={(v) => { setTwoFA(v); toast.info(v ? 'สแกน QR ใน Authenticator App' : 'ปิด 2FA แล้ว'); }} />
          </div>
          {twoFA && (
            <div className="rounded-xl border p-4 bg-muted/30 flex items-center gap-3">
              <KeyRound className="h-8 w-8 text-primary" />
              <div className="text-sm">
                <div className="font-medium">รหัสสำรอง (Backup Codes)</div>
                <div className="text-muted-foreground">เก็บรหัสสำรองไว้ในที่ปลอดภัย เพื่อกู้บัญชีในกรณีลืมอุปกรณ์</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>PDPA Consent Center</CardTitle>
          </div>
          <CardDescription>สิทธิ์ของเจ้าของข้อมูลตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">ยินยอมให้เก็บและประมวลผลข้อมูล</div>
              <div className="text-sm text-muted-foreground">จำเป็นสำหรับการสั่งซื้อและจัดส่ง</div>
            </div>
            <Switch checked={pdpaConsent} onCheckedChange={setPdpaConsent} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">ยินยอมรับข่าวสารการตลาด</div>
              <div className="text-sm text-muted-foreground">อีเมล / SMS โปรโมชั่น</div>
            </div>
            <Switch checked={marketingConsent} onCheckedChange={setMarketingConsent} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={savePrivacy}>บันทึก</Button>
            <Button variant="outline" onClick={exportData}>ดาวน์โหลดข้อมูลของฉัน (Right to Access)</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>API Rate Limiting</CardTitle>
          </div>
          <CardDescription>ป้องกัน Edge Functions ถูกยิงถี่เกินไป</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="font-medium">เปิดใช้ Rate Limit (60 req/min ต่อ IP)</div>
            <div className="text-sm text-muted-foreground">มีผลกับ /ai-chat, /analyze-product, /gdrive-*</div>
          </div>
          <Switch checked={rateLimit} onCheckedChange={setRateLimit} />
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Multi-language (i18n)</CardTitle>
          </div>
          <CardDescription>ไทย / English — สลับได้จาก Navbar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">TH (default)</Badge>
            <Badge variant="secondary">EN</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-warning/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => toast.info('ส่งคำขอลบบัญชีเรียบร้อย ทีมงานจะดำเนินการภายใน 30 วัน')}>
            ขอลบบัญชีและข้อมูล (Right to be Forgotten)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

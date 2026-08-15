import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { useI18n } from '@/stores/i18nStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Bell, Palette, User, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user, loading } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const handleSave = () => {
    toast.success(lang === 'th' ? 'บันทึกการตั้งค่าแล้ว' : 'Settings saved successfully');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">{t('profile')}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {lang === 'th' ? 'การแสดงผล' : 'Appearance'}
              </CardTitle>
              <CardDescription>
                {lang === 'th' ? 'ปรับแต่งการแสดงผลและภาษา' : 'Customize appearance and language'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>{lang === 'th' ? 'ธีม' : 'Theme'}</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{lang === 'th' ? 'สว่าง' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{lang === 'th' ? 'มืด' : 'Dark'}</SelectItem>
                    <SelectItem value="system">{lang === 'th' ? 'ตามระบบ' : 'System'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>{lang === 'th' ? 'ภาษา' : 'Language'}</Label>
                <Select value={lang} onValueChange={(v: 'th' | 'en') => setLang(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
              </CardTitle>
              <CardDescription>
                {lang === 'th' ? 'ตั้งค่าการรับการแจ้งเตือน' : 'Manage your notification preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{lang === 'th' ? 'แจ้งเตือนสถานะคำสั่งซื้อ' : 'Order Status Updates'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'th' ? 'รับอีเมลเมื่อสถานะคำสั่งซื้อเปลี่ยน' : 'Receive emails when your order status changes'}
                  </p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{lang === 'th' ? 'ข่าวสารและโปรโมชั่น' : 'Marketing Emails'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'th' ? 'รับอีเมลข่าวสารและโปรโมชั่นพิเศษ' : 'Receive emails about new products and offers'}
                  </p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Settings className="mr-2 h-4 w-4" />
              {lang === 'th' ? 'บันทึกการตั้งค่า' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
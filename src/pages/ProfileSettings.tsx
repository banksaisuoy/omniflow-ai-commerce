import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useI18n } from '@/stores/i18nStore';
import { User, Bell, Palette, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      toast.success(lang === 'th' ? 'บันทึกการตั้งค่าเรียบร้อยแล้ว' : 'Settings saved successfully');
    }, 800);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('profile_settings')}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('theme_preferences')}
              </CardTitle>
              <CardDescription>
                {lang === 'th' ? 'เลือกรูปแบบการแสดงผลที่คุณต้องการ' : 'Choose your preferred appearance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder={lang === 'th' ? 'เลือกธีม' : 'Select theme'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{lang === 'th' ? 'สว่าง' : 'Light'}</SelectItem>
                  <SelectItem value="dark">{lang === 'th' ? 'มืด' : 'Dark'}</SelectItem>
                  <SelectItem value="system">{lang === 'th' ? 'ตามระบบ' : 'System'}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('language')}
              </CardTitle>
              <CardDescription>
                {lang === 'th' ? 'เลือกภาษาที่ใช้แสดงผลบนเว็บไซต์' : 'Select your preferred language for the website'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={lang} onValueChange={(val: 'en' | 'th') => setLang(val)}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder={lang === 'th' ? 'เลือกภาษา' : 'Select language'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('notifications')}
              </CardTitle>
              <CardDescription>
                {lang === 'th' ? 'จัดการการรับการแจ้งเตือนจากเรา' : 'Manage how you receive notifications from us'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{lang === 'th' ? 'การแจ้งเตือนคำสั่งซื้อ' : 'Order Notifications'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'th' ? 'รับอีเมลเมื่อมีการอัปเดตสถานะคำสั่งซื้อ' : 'Receive emails when your order status updates'}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{lang === 'th' ? 'โปรโมชันและข่าวสาร' : 'Promotions & News'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'th' ? 'รับข้อเสนอพิเศษและข่าวสารใหม่ๆ' : 'Receive special offers and news updates'}
                  </p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (lang === 'th' ? 'บันทึกการตั้งค่า' : 'Save Changes')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
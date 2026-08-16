import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useI18n } from '@/stores/i18nStore';
import { toast } from 'sonner';
import { User, Bell, Palette, Save } from 'lucide-react';

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('settings_saved'));
    }, 800);
  };

  if (loading || !user) {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            {t('profile_settings')}
          </h1>
          <p className="text-muted-foreground mt-2">{user.email}</p>
        </header>

        <div className="space-y-8">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {t('theme_settings')}
              </CardTitle>
              <CardDescription>
                ปรับแต่งหน้าตาของแอปพลิเคชัน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-base cursor-pointer">
                  Dark Mode
                </Label>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {t('notification_settings')}
              </CardTitle>
              <CardDescription>
                เลือกช่องทางที่คุณต้องการรับข่าวสารและโปรโมชั่น
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base cursor-pointer">
                    {t('email_notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    รับข่าวสาร โปรโมชั่น และอัปเดตคำสั่งซื้อทางอีเมล
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="text-base cursor-pointer">
                    {t('sms_notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    รับการแจ้งเตือนสถานะคำสั่งซื้อผ่าน SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto ml-auto gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? '...' : t('save_changes')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useI18n } from '@/stores/i18nStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, lang } = useI18n();
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!mounted) return null;

  const handleSave = () => {
    toast.success(t('profile_saved'));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-display text-4xl mb-8">{t('profile_settings')}</h1>

        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('account_details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input value={user?.email || ''} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t('preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2">
                <Label>{t('theme')}</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('theme')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{lang === 'th' ? 'สว่าง' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{lang === 'th' ? 'มืด' : 'Dark'}</SelectItem>
                    <SelectItem value="system">{lang === 'th' ? 'ตามระบบ' : 'System'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>{t('notifications')}</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif" className="flex-1">
                    {t('email_notifications')}
                  </Label>
                  <Switch
                    id="email-notif"
                    checked={emailNotif}
                    onCheckedChange={setEmailNotif}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notif" className="flex-1">
                    {t('sms_notifications')}
                  </Label>
                  <Switch
                    id="sms-notif"
                    checked={smsNotif}
                    onCheckedChange={setSmsNotif}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            {t('save_changes')}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
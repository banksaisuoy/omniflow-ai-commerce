import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/stores/i18nStore';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(t('profile_saved'));
    }, 500);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <p>{t('please_signin')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-display mb-8">{t('profile')}</h1>

        <div className="space-y-8">
          <div className="p-6 bg-card rounded-2xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('account_info')}</h2>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('email')}</Label>
              <div className="font-medium">{user?.email}</div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">{t('preferences')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('theme')}</Label>
                  <p className="text-sm text-muted-foreground">{t('theme_desc')}</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t('theme')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light')}</SelectItem>
                    <SelectItem value="dark">{t('dark')}</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">{t('notifications')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base" htmlFor="email-notif">{t('email_notif')}</Label>
                  <p className="text-sm text-muted-foreground">{t('email_notif_desc')}</p>
                </div>
                <Switch 
                  id="email-notif" 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base" htmlFor="push-notif">{t('push_notif')}</Label>
                  <p className="text-sm text-muted-foreground">{t('push_notif_desc')}</p>
                </div>
                <Switch 
                  id="push-notif" 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications} 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('save_changes')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
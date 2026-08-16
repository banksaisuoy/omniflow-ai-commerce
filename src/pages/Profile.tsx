import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/stores/i18nStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    toast.success(t('settings_saved') || 'Settings saved successfully');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('signin')}</h1>
          <p className="text-muted-foreground">Please sign in to view your profile settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{t('profile_settings')}</h1>
          <p className="text-muted-foreground mt-2">{user?.email}</p>
        </header>

        <div className="space-y-8 bg-card p-6 rounded-xl border border-border">
          {/* Theme Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('theme_settings')}</h2>
            <div className="flex items-center gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
              >
                {t('theme_light') || 'Light'}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                {t('theme_dark') || 'Dark'}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
              >
                {t('theme_system') || 'System'}
              </Button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">{t('notification_settings')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('email_notifications')}</p>
                <p className="text-sm text-muted-foreground">{t('email_notifications_desc')}</p>
              </div>
              <Button
                variant={notificationsEnabled ? 'default' : 'secondary'}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? t('enabled') || 'Enabled' : t('disabled') || 'Disabled'}
              </Button>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-6 border-t border-border flex justify-end">
            <Button onClick={handleSave}>
              {t('save_changes')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
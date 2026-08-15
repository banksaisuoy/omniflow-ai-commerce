import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/stores/i18nStore';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { Switch } from '@/components/ui/switch';
import { User, Settings, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotions: true,
  });

  const handleSave = () => {
    toast.success(t('profile_saved'));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">{t('profile_settings')}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Navigation Sidebar */}
          <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start gap-3 rounded-xl" size="lg">
              <Settings className="h-5 w-5" />
              {t('general')}
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl" size="lg">
              <Palette className="h-5 w-5" />
              {t('appearance')}
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl" size="lg">
              <Bell className="h-5 w-5" />
              {t('notifications')}
            </Button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 space-y-8">
            {/* Appearance Section */}
            <section className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">{t('appearance')}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <div className="h-20 w-full bg-slate-50 rounded-lg mb-3 border"></div>
                    <p className="font-medium text-sm">{t('theme_light')}</p>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <div className="h-20 w-full bg-slate-900 rounded-lg mb-3 border border-slate-700"></div>
                    <p className="font-medium text-sm">{t('theme_dark')}</p>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <div className="h-20 w-full bg-gradient-to-br from-slate-50 to-slate-900 rounded-lg mb-3 border"></div>
                    <p className="font-medium text-sm">{t('theme_system')}</p>
                  </button>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">{t('notifications')}</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('email_notifications')}</h3>
                    <p className="text-sm text-muted-foreground">{t('email_notifications_desc')}</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(c) => setNotifications({...notifications, email: c})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('sms_notifications')}</h3>
                    <p className="text-sm text-muted-foreground">{t('sms_notifications_desc')}</p>
                  </div>
                  <Switch 
                    checked={notifications.sms} 
                    onCheckedChange={(c) => setNotifications({...notifications, sms: c})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('promotional_emails')}</h3>
                    <p className="text-sm text-muted-foreground">{t('promotional_emails_desc')}</p>
                  </div>
                  <Switch 
                    checked={notifications.promotions} 
                    onCheckedChange={(c) => setNotifications({...notifications, promotions: c})}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} size="lg" className="rounded-xl px-8 shadow-soft hover:shadow-lg transition-all hover:-translate-y-0.5">
                {t('save_changes')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
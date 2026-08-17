import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User, Bell, Palette, Settings as SettingsIcon, Mail, MessageSquare, Tag } from 'lucide-react';
import { useI18n } from '@/stores/i18nStore';

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    promotions: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('user_notification_prefs');
    if (savedPrefs) {
      try {
        setNotifications(JSON.parse(savedPrefs));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications) => (checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = () => {
    localStorage.setItem('user_notification_prefs', JSON.stringify(notifications));
    toast.success(t('settings_saved') || 'Settings saved successfully');
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('profile_settings') || 'Profile Settings'}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Sidebar navigation placeholder if needed in future, currently just layout */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || 'Customer'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Theme Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t('theme_preferences') || 'Theme Preferences'}
                </CardTitle>
                <CardDescription>
                  Customize the appearance of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 mb-2 shadow-sm" />
                    <span className="text-sm font-medium">{t('light') || 'Light'}</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 mb-2 shadow-sm" />
                    <span className="text-sm font-medium">{t('dark') || 'Dark'}</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-zinc-950 border border-gray-300 mb-2 shadow-sm" />
                    <span className="text-sm font-medium">{t('system') || 'System'}</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('notification_preferences') || 'Notification Preferences'}
                </CardTitle>
                <CardDescription>
                  Choose what updates you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="email-notif" className="flex items-center gap-2 text-base">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {t('email_notifications') || 'Email Notifications'}
                    </Label>
                    <span className="text-sm text-muted-foreground">Receive general updates via email.</span>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={notifications.email}
                    onCheckedChange={handleNotificationChange('email')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="order-notif" className="flex items-center gap-2 text-base">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      {t('order_updates') || 'Order Updates'}
                    </Label>
                    <span className="text-sm text-muted-foreground">Get notified about your order status.</span>
                  </div>
                  <Switch
                    id="order-notif"
                    checked={notifications.orders}
                    onCheckedChange={handleNotificationChange('orders')}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="promo-notif" className="flex items-center gap-2 text-base">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {t('promotional_offers') || 'Promotional Offers'}
                    </Label>
                    <span className="text-sm text-muted-foreground">Receive discounts and special offers.</span>
                  </div>
                  <Switch
                    id="promo-notif"
                    checked={notifications.promotions}
                    onCheckedChange={handleNotificationChange('promotions')}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button size="lg" onClick={handleSave}>
                {t('save_changes') || 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
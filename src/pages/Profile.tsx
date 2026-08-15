import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/stores/i18nStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

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
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('settings_saved') || 'Settings saved successfully');
    }, 1000);
  };

  if (loading || !user) {
    return null; 
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">
          {t('profile')}
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* User Info Section */}
          <Card className="glass border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle>{t('my_account')}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">{t('role') || 'Role'}</Label>
                  <div className="font-medium capitalize mt-1 text-foreground">
                    {user.user_metadata?.role || 'Customer'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="glass border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle>{t('theme_settings')}</CardTitle>
              <CardDescription>{t('theme_settings_desc') || 'Manage your appearance preferences'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  {t('light')}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  {t('dark')}
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="flex-1"
                >
                  {t('system_theme')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="glass border-border/50 shadow-soft md:col-span-2">
            <CardHeader>
              <CardTitle>{t('notification_settings')}</CardTitle>
              <CardDescription>{t('notification_settings_desc') || 'Manage how you receive updates'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    {t('email_notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('email_notifications_desc') || 'Receive order updates and promotions via email.'}
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
                  <Label htmlFor="sms-notifications" className="text-base font-medium">
                    {t('sms_notifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('sms_notifications_desc') || 'Receive order updates via SMS.'}
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto ml-auto">
                {isSaving ? (t('saving') || 'Saving...') : t('save_changes')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Layout } from '@/components/layout/Layout';
import { useI18n } from '@/stores/i18nStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Bell, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [marketingEmails, setMarketingEmails] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSave = () => {
    toast.success(t('settings_saved') || 'Settings saved successfully');
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display">{t('profile_settings')}</h1>
          <p className="text-muted-foreground mt-2">{t('profile_settings_desc')}</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" />
              {t('general')}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              {t('appearance')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              {t('notifications')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('account_info')}</CardTitle>
                <CardDescription>{t('account_info_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('email_label')}</Label>
                  <div className="p-3 bg-muted rounded-md border border-border text-sm">
                    {user.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t('theme')}</CardTitle>
                <CardDescription>{t('theme_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="w-full"
                  >
                    {t('light_mode')}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="w-full"
                  >
                    {t('dark_mode')}
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="w-full"
                  >
                    {t('system_mode')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('notification_preferences')}</CardTitle>
                <CardDescription>{t('notification_preferences_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('order_updates')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('order_updates_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={orderUpdates}
                    onCheckedChange={setOrderUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('marketing_emails')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('marketing_emails_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t('promotions')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('promotions_desc')}
                    </p>
                  </div>
                  <Switch
                    checked={promotions}
                    onCheckedChange={setPromotions}
                  />
                </div>

                <Button onClick={handleSave} className="w-full mt-4 gap-2">
                  <Save className="h-4 w-4" />
                  {t('save_changes')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
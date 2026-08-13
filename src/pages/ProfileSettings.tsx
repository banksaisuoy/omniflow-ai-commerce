import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useI18n } from '@/stores/i18nStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useI18n();

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('profile_settings')}</h1>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('my_account')}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>

          {/* Appearance (Theme & Language) */}
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
              <CardDescription>Choose your preferred theme and language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Theme</Label>
                <RadioGroup 
                  defaultValue={theme} 
                  onValueChange={(val) => setTheme(val)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">{lang === 'th' ? 'สว่าง' : 'Light'}</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">{lang === 'th' ? 'มืด' : 'Dark'}</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">{lang === 'th' ? 'ตามระบบ' : 'System'}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-base">Language</Label>
                <RadioGroup 
                  defaultValue={lang} 
                  onValueChange={(val) => setLang(val as 'th' | 'en')}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="th" id="th" />
                    <Label htmlFor="th">ไทย</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">English</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications')}</CardTitle>
              <CardDescription>Manage your email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-updates" className="text-base">{t('order_updates')}</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your order status.</p>
                </div>
                <Switch
                  id="order-updates"
                  checked={orderUpdates}
                  onCheckedChange={setOrderUpdates}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions" className="text-base">{t('promotions')}</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new promotions and offers.</p>
                </div>
                <Switch
                  id="promotions"
                  checked={promotions}
                  onCheckedChange={setPromotions}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => navigate('/')}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
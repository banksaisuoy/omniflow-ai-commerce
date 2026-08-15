import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/stores/i18nStore';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [marketingEmails, setMarketingEmails] = useState(true);

  const handleSave = () => {
    toast.success(t('settings_saved'));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-display mb-8">{t('profile_settings')}</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('theme')}</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light')}</SelectItem>
                    <SelectItem value="dark">{t('dark')}</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('language')}</Label>
                <Select value={lang} onValueChange={(v) => setLang(v as 'th' | 'en')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('notifications')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('marketing_emails')}</Label>
                  <p className="text-sm text-muted-foreground">{t('marketing_emails_desc')}</p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
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
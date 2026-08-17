import { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/stores/i18nStore';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { setTheme, theme } = useTheme();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    toast.success(t('save_changes'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-serif">{t('profile_settings')}</h1>

          <Card>
            <CardHeader>
              <CardTitle>{t('my_account')}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('theme')}</CardTitle>
              <CardDescription>{t('theme_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light_mode')}</SelectItem>
                    <SelectItem value="dark">{t('dark_mode')}</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('notifications')}</CardTitle>
              <CardDescription>{t('notifications_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Switch 
                  id="notifications" 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
                <Label htmlFor="notifications">{t('enable_notifications')}</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>{t('save_changes')}</Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
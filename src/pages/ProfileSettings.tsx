import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { useI18n } from '@/stores/i18nStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, lang } = useI18n();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (!loading && !user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t('settings')}</h1>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>View your account information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Email Address</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme Preference</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred theme or sync with system settings.
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{lang === 'th' ? 'สว่าง' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{lang === 'th' ? 'มืด' : 'Dark'}</SelectItem>
                    <SelectItem value="system">{lang === 'th' ? 'ตามระบบ' : 'System'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive order updates, promotions, and news via email.
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive delivery tracking and urgent alerts via SMS.
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
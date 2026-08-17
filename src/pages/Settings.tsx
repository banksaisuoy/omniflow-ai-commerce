import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/stores/i18nStore";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { User, Bell, Palette, Globe, Check } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  // Mock notification settings state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-display mb-8">{t('settings')}</h1>

        <div className="space-y-8">

          {/* Profile Section */}
          <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('profile')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t('email') || 'Email'}</Label>
                <div className="text-lg font-medium mt-1">{user?.email}</div>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Palette className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('appearance')}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="w-32"
              >
                Light
                {theme === 'light' && <Check className="ml-2 h-4 w-4" />}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="w-32"
              >
                Dark
                {theme === 'dark' && <Check className="ml-2 h-4 w-4" />}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="w-32"
              >
                System
                {theme === 'system' && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </section>

          {/* Language Section */}
          <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('language')}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                variant={lang === 'th' ? 'default' : 'outline'}
                onClick={() => setLang('th')}
                className="w-32"
              >
                ภาษาไทย
                {lang === 'th' && <Check className="ml-2 h-4 w-4" />}
              </Button>
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLang('en')}
                className="w-32"
              >
                English
                {lang === 'en' && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </section>

          {/* Notifications Section (Mock) */}
          <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Bell className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('notifications')}</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive order updates and promotions via email.</p>
                </div>
                <Switch
                  checked={emailNotifs}
                  onCheckedChange={setEmailNotifs}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser.</p>
                </div>
                <Switch
                  checked={pushNotifs}
                  onCheckedChange={setPushNotifs}
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}

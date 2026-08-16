import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { User, Bell, Palette, Shield } from 'lucide-react';
import { useI18n } from '@/stores/i18nStore';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useI18n();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [promoNotifs, setPromoNotifs] = useState(true);

  const handleSavePreferences = () => {
    toast.success(lang === 'th' ? 'บันทึกการตั้งค่าแล้ว' : 'Preferences saved');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('signin')}</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">{t('my_account')}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-2">
            <Button variant="secondary" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              โปรไฟล์
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Palette className="mr-2 h-4 w-4" />
              การแสดงผล
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              การแจ้งเตือน
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              ความปลอดภัย
            </Button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  การแสดงผล (Theme)
                </CardTitle>
                <CardDescription>ปรับแต่งการแสดงผลของแอปพลิเคชัน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>โหมดสี (Color Mode)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant={theme === 'light' ? 'default' : 'outline'} 
                      onClick={() => setTheme('light')}
                    >
                      สว่าง (Light)
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? 'default' : 'outline'} 
                      onClick={() => setTheme('dark')}
                    >
                      มืด (Dark)
                    </Button>
                    <Button 
                      variant={theme === 'system' ? 'default' : 'outline'} 
                      onClick={() => setTheme('system')}
                    >
                      ตามระบบ (System)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label>ภาษา (Language)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={lang === 'th' ? 'default' : 'outline'} 
                      onClick={() => setLang('th')}
                    >
                      ภาษาไทย (TH)
                    </Button>
                    <Button 
                      variant={lang === 'en' ? 'default' : 'outline'} 
                      onClick={() => setLang('en')}
                    >
                      English (EN)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  การแจ้งเตือน (Notifications)
                </CardTitle>
                <CardDescription>จัดการช่องทางการรับการแจ้งเตือน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">อีเมล (Email)</Label>
                    <p className="text-sm text-muted-foreground">รับการแจ้งเตือนคำสั่งซื้อทางอีเมล</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS</Label>
                    <p className="text-sm text-muted-foreground">รับการแจ้งเตือนการจัดส่งทาง SMS</p>
                  </div>
                  <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">โปรโมชั่น (Promotions)</Label>
                    <p className="text-sm text-muted-foreground">รับข่าวสารและโปรโมชั่นพิเศษ</p>
                  </div>
                  <Switch checked={promoNotifs} onCheckedChange={setPromoNotifs} />
                </div>

                <Button className="w-full mt-4" onClick={handleSavePreferences}>
                  บันทึกการตั้งค่า
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

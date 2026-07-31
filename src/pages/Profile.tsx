import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Bell, Shield, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/stores/i18nStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email_notifications: true,
      sms_notifications: false,
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      const prefs = profile.preferences as Record<string, any> || {};
      form.reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email_notifications: prefs.email_notifications ?? true,
        sms_notifications: prefs.sms_notifications ?? false,
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error('Not authenticated');

      const preferences = {
        ...(profile?.preferences as Record<string, any> || {}),
        email_notifications: values.email_notifications,
        sms_notifications: values.sms_notifications,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name || null,
          phone: values.phone || null,
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('profile_updated') || 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error(t('profile_update_error') || 'Failed to update profile');
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4 flex justify-center items-center h-[50vh]">
          <p className="text-muted-foreground">{t('signin_required') || 'Please sign in to view your profile'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t('my_account') || 'My Account'}</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex h-auto p-1 bg-muted/50">
            <TabsTrigger value="general" className="py-2.5 px-6 rounded-md">
              <User className="w-4 h-4 mr-2" />
              {t('general') || 'General'}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="py-2.5 px-6 rounded-md">
              <Bell className="w-4 h-4 mr-2" />
              {t('preferences') || 'Preferences'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t('profile_settings') || 'Profile Settings'}</CardTitle>
                <CardDescription>
                  {t('profile_desc') || 'Manage your personal information and contact details.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('full_name') || 'Full Name'}</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormItem>
                          <FormLabel>{t('email') || 'Email Address'}</FormLabel>
                          <FormControl>
                            <Input value={user.email || ''} disabled className="bg-muted/50" />
                          </FormControl>
                          <FormDescription>
                            {t('email_desc') || 'Your email is used for login and cannot be changed here.'}
                          </FormDescription>
                        </FormItem>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('phone_number') || 'Phone Number'}</FormLabel>
                              <FormControl>
                                <Input placeholder="+66 81 234 5678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {t('save_changes') || 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t('theme_settings') || 'Appearance'}</CardTitle>
                <CardDescription>
                  {t('theme_desc') || 'Customize how the application looks on your device.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-none justify-start h-12 px-4"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-5 h-5 mr-3" />
                    {t('light_mode') || 'Light'}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-none justify-start h-12 px-4"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-5 h-5 mr-3" />
                    {t('dark_mode') || 'Dark'}
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="flex-1 sm:flex-none justify-start h-12 px-4 hidden sm:flex"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="w-5 h-5 mr-3" />
                    {t('system_mode') || 'System'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>{t('notifications') || 'Notifications'}</CardTitle>
                <CardDescription>
                  {t('notifications_desc') || 'Manage how you receive updates and alerts.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t('email_notifications') || 'Email Notifications'}
                                </FormLabel>
                                <FormDescription>
                                  {t('email_notifications_desc') || 'Receive order updates and promotions via email.'}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sms_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t('sms_notifications') || 'SMS Notifications'}
                                </FormLabel>
                                <FormDescription>
                                  {t('sms_notifications_desc') || 'Receive delivery updates via text message.'}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-border/50">
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {t('save_changes') || 'Save Preferences'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
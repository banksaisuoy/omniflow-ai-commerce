import { supabase } from '@/integrations/supabase/client';

export const authService = {
  setAuthCookie: async (token: string) => {
    // Rely on server-side httpOnly cookie setting to prevent XSS
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SIGNED_IN', session: { access_token: token } })
    });
  },
  
  clearAuthCookie: async () => {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SIGNED_OUT', session: null })
    });
  },
  
  rotateToken: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (data?.session) {
      await authService.setAuthCookie(data.session.access_token);
    }
    return { data, error };
  },
  
  revokeToken: async () => {
    const { error } = await supabase.auth.signOut();
    await authService.clearAuthCookie();
    return { error };
  },
};
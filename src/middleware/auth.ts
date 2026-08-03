import { supabase } from '@/integrations/supabase/client';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = {
  requireAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real server environment, we should check cookies or headers
      const token = req.cookies?.['sb-access-token'] || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      // Verify token with Supabase (mocked for simplicity, in reality use supabase.auth.getUser(token))
      // Assuming verification succeeds and yields a user:
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
         return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // In Supabase, roles can be checked via user metadata or a dedicated roles table
      const { data: userData, error } = await supabase
        .from('users') // Assuming a users table with a role column, adjust if using a different setup
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error || userData?.role !== 'admin') {
         return res.status(403).json({ error: 'Forbidden: Requires admin privileges' });
      }
      
      next();
    } catch (e: any) {
       res.status(500).json({ error: e.message });
    }
  }
};
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use process.env for Node (Express) and import.meta.env for Vite (Browser)
const getEnvVar = (key: string, viteKey: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey] as string;
  }
  return fallback;
};

const supabaseUrl = getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL', 'https://placeholder-url.supabase.co');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'placeholder-key');

// Secure custom storage that does NOT use localStorage.
// In a real application, the browser would rely entirely on the httpOnly cookie sent by the server.
// For the Supabase client to function, we provide a dummy in-memory storage so it doesn't write to localStorage.
const memoryStorage = new Map<string, string>();
const customStorage = {
  getItem: (key: string) => {
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStorage.delete(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or localStorage fallback
export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('affan_supabase_url') || '';
  const localKey = localStorage.getItem('affan_supabase_anon_key') || '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (!url || !key) {
    localStorage.removeItem('affan_supabase_url');
    localStorage.removeItem('affan_supabase_anon_key');
  } else {
    localStorage.setItem('affan_supabase_url', url.trim());
    localStorage.setItem('affan_supabase_anon_key', key.trim());
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

import { createClient } from '@supabase/supabase-js';

// Supabase Gonzaga Cloud Database credentials
const DEFAULT_SUPABASE_URL = 'https://afrrbvqwiubrxiawqvpj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcnJidnF3aXVicnhpYXdxdnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTM1NTUsImV4cCI6MjEwMzY4OTU1NX0.czsH1VSBX2oYFoFM_w9y-KUPcevVrtSVw3nXvbXiOzs';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


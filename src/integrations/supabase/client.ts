import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qaecjlqraydbprsjfjdg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZWNqbHFyYXlkYnByc2pmamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTgzNjYsImV4cCI6MjA1MTkzNDM2Nn0.UdPpje0F8GsMGPlBLGHNKDQTpzIVQT1SSZuj2DmYhkI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  },
  db: {
    schema: 'public'
  }
});
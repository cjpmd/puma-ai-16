import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qaecjlqraydbprsjfjdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZWNqbHFyYXlkYnByc2pmamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NjY5NDAsImV4cCI6MjAyMjQ0Mjk0MH0.qDPDUPKoLyQWZOc_4ZEs_ip4nLGkL6WQ9HHIXEj5QT4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
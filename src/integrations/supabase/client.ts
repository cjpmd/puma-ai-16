import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qaecjlqraydbprsjfjdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZWNqbHFyYXlkYnByc2pmamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NjY5NDAsImV4cCI6MjAyMjQ0Mjk0MH0.qDPDUPKoLyQWZOc_4ZEs_ip4nLGkL6WQ9HHIXEj5QT4';

export type Database = {
  public: {
    Tables: {
      role_suitability: {
        Row: {
          id: string;
          player_id: string | null;
          role_id: string | null;
          suitability_score: number;
          calculation_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      players: {
        Row: {
          id: string;
          name: string;
          age: number;
          squad_number: number;
          team_category: string | null;
        };
      };
      role_definitions: {
        Row: {
          id: string;
          abbreviation: string;
          full_name: string;
          description: string | null;
        };
      };
      player_attributes: {
        Row: {
          id: string;
          player_id: string | null;
          name: string;
          value: number;
          category: string;
          created_at: string | null;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaecjlqraydbprsjfjdg.supabase.co';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZWNqbHFyYXlkYnByc2pmamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTgzNjYsImV4cCI6MjA1MTkzNDM2Nn0.UdPpje0F8GsMGPlBLGHNKDQTpzIVQT1SSZuj2DmYhkI';

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
          date_of_birth: string;
          player_type: string;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
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
      fixture_team_scores: {
        Row: {
          id: string;
          fixture_id: string;
          team_number: number;
          score: number;
          created_at: string;
          updated_at: string;
        };
      };
      fixture_team_times: {
        Row: {
          id: string;
          fixture_id: string;
          team_number: number;
          meeting_time: string | null;
          start_time: string | null;
          end_time: string | null;
          performance_category: string;
          created_at: string;
          updated_at: string;
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
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client'
    }
  }
});

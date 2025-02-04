export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attribute_settings: {
        Row: {
          category: string
          created_at: string | null
          display_name: string | null
          display_order: number | null
          id: string
          is_deleted: boolean | null
          is_enabled: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_deleted?: boolean | null
          is_enabled?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          id?: string
          is_deleted?: boolean | null
          is_enabled?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coach_badges: {
        Row: {
          badge_id: string | null
          coach_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          badge_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          badge_id?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "coaching_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_badges_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_approved: boolean | null
          name: string
          role: Database["public"]["Enums"]["coach_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_approved?: boolean | null
          name: string
          role?: Database["public"]["Enums"]["coach_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_approved?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["coach_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coaching_badges: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      coaching_comments: {
        Row: {
          coach_id: string | null
          comment: string
          created_at: string | null
          id: string
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          comment: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_comments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "coaching_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "coaching_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      devices: {
        Row: {
          assigned_player_id: string | null
          device_name: string
          id: number
        }
        Insert: {
          assigned_player_id?: string | null
          device_name: string
          id?: number
        }
        Update: {
          assigned_player_id?: string | null
          device_name?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "devices_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "devices_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "devices_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_assigned_player_id_fkey"
            columns: ["assigned_player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      event_periods: {
        Row: {
          created_at: string | null
          duration_minutes: number
          event_id: string
          event_type: string
          id: string
          period_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          event_id: string
          event_type: string
          id?: string
          period_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          event_id?: string
          event_type?: string
          id?: string
          period_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      festival_team_players: {
        Row: {
          created_at: string | null
          festival_team_id: string | null
          id: string
          is_substitute: boolean | null
          performance_category: string | null
          player_id: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          festival_team_id?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          position: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          festival_team_id?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "festival_team_players_festival_team_id_fkey"
            columns: ["festival_team_id"]
            isOneToOne: false
            referencedRelation: "festival_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festival_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festival_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "festival_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "festival_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festival_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      festival_teams: {
        Row: {
          category: string | null
          created_at: string | null
          festival_id: string | null
          id: string
          team_name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          festival_id?: string | null
          id?: string
          team_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          festival_id?: string | null
          id?: string
          team_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "festival_teams_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festivals"
            referencedColumns: ["id"]
          },
        ]
      }
      festivals: {
        Row: {
          created_at: string | null
          date: string
          end_time: string | null
          format: string | null
          id: string
          location: string | null
          meeting_time: string | null
          number_of_teams: number
          start_time: string | null
          system_category: string | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time?: string | null
          format?: string | null
          id?: string
          location?: string | null
          meeting_time?: string | null
          number_of_teams: number
          start_time?: string | null
          system_category?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string | null
          format?: string | null
          id?: string
          location?: string | null
          meeting_time?: string | null
          number_of_teams?: number
          start_time?: string | null
          system_category?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fixture_player_positions: {
        Row: {
          created_at: string | null
          fixture_id: string | null
          id: string
          is_substitute: boolean | null
          performance_category: string | null
          period_id: string | null
          player_id: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id?: string | null
          position: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_player_positions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_player_positions_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fixture_playing_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_player_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_player_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_player_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_player_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_player_positions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      fixture_playing_periods: {
        Row: {
          created_at: string | null
          duration_minutes: number
          fixture_id: string | null
          id: string
          start_minute: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          fixture_id?: string | null
          id?: string
          start_minute: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          fixture_id?: string | null
          id?: string
          start_minute?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_playing_periods_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      fixture_team_selections: {
        Row: {
          created_at: string | null
          fixture_id: string | null
          id: string
          is_captain: boolean | null
          performance_category: string | null
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          is_captain?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          is_captain?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_team_selections_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      fixtures: {
        Row: {
          away_score: number | null
          category: string | null
          created_at: string | null
          date: string
          end_time: string | null
          format: string | null
          home_score: number | null
          id: string
          is_friendly: boolean | null
          is_home: boolean | null
          location: string | null
          meeting_time: string | null
          motm_player_id: string | null
          number_of_teams: number | null
          opponent: string
          outcome: string | null
          performance_category: string | null
          start_time: string | null
          team_name: string
          time: string | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          category?: string | null
          created_at?: string | null
          date: string
          end_time?: string | null
          format?: string | null
          home_score?: number | null
          id?: string
          is_friendly?: boolean | null
          is_home?: boolean | null
          location?: string | null
          meeting_time?: string | null
          motm_player_id?: string | null
          number_of_teams?: number | null
          opponent: string
          outcome?: string | null
          performance_category?: string | null
          start_time?: string | null
          team_name: string
          time?: string | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          category?: string | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          format?: string | null
          home_score?: number | null
          id?: string
          is_friendly?: boolean | null
          is_home?: boolean | null
          location?: string | null
          meeting_time?: string | null
          motm_player_id?: string | null
          number_of_teams?: number | null
          opponent?: string
          outcome?: string | null
          performance_category?: string | null
          start_time?: string | null
          team_name?: string
          time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy: number
          created_at: string | null
          id: string
          model_file_path: string | null
          parameters: Json | null
          training_date: string | null
          updated_at: string | null
          version: string
        }
        Insert: {
          accuracy: number
          created_at?: string | null
          id?: string
          model_file_path?: string | null
          parameters?: Json | null
          training_date?: string | null
          updated_at?: string | null
          version: string
        }
        Update: {
          accuracy?: number
          created_at?: string | null
          id?: string
          model_file_path?: string | null
          parameters?: Json | null
          training_date?: string | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      ml_training_sessions: {
        Row: {
          activity_type: string
          created_at: string | null
          device_id: number | null
          duration: number | null
          end_time: string | null
          id: string
          player_id: string | null
          start_time: string
          updated_at: string | null
          video_timestamp: number | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          device_id?: number | null
          duration?: number | null
          end_time?: string | null
          id?: string
          player_id?: string | null
          start_time?: string
          updated_at?: string | null
          video_timestamp?: number | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          device_id?: number | null
          duration?: number | null
          end_time?: string | null
          id?: string
          player_id?: string | null
          start_time?: string
          updated_at?: string | null
          video_timestamp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_training_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "ml_training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "ml_training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      pass_analysis: {
        Row: {
          created_at: string | null
          end_x: number
          end_y: number
          id: string
          is_successful: boolean | null
          player_id: string | null
          start_x: number
          start_y: number
          timestamp: number
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_x: number
          end_y: number
          id?: string
          is_successful?: boolean | null
          player_id?: string | null
          start_x: number
          start_y: number
          timestamp: number
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_x?: number
          end_y?: number
          id?: string
          is_successful?: boolean | null
          player_id?: string | null
          start_x?: number
          start_y?: number
          timestamp?: number
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pass_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "pass_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "pass_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "pass_analysis_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      player_attributes: {
        Row: {
          abbreviation: string | null
          category: string
          created_at: string | null
          id: string
          name: string
          player_id: string | null
          value: number
        }
        Insert: {
          abbreviation?: string | null
          category: string
          created_at?: string | null
          id?: string
          name: string
          player_id?: string | null
          value: number
        }
        Update: {
          abbreviation?: string | null
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          player_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_base_info: {
        Row: {
          actual_playing_time: string | null
          agreed_playing_time: string | null
          created_at: string | null
          id: string
          left_foot: number | null
          nationality: string | null
          personality: string | null
          player_id: string | null
          position: string | null
          right_foot: number | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          actual_playing_time?: string | null
          agreed_playing_time?: string | null
          created_at?: string | null
          id?: string
          left_foot?: number | null
          nationality?: string | null
          personality?: string | null
          player_id?: string | null
          position?: string | null
          right_foot?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_playing_time?: string | null
          agreed_playing_time?: string | null
          created_at?: string | null
          id?: string
          left_foot?: number | null
          nationality?: string | null
          personality?: string | null
          player_id?: string | null
          position?: string | null
          right_foot?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_base_info_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_base_info_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_base_info_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_base_info_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_base_info_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      player_objectives: {
        Row: {
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          player_id: string | null
          points: number | null
          review_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          points?: number | null
          review_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          points?: number | null
          review_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_objectives_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_objectives_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_objectives_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_objectives_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_objectives_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_objectives_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_parents: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_physical_data: {
        Row: {
          age: number | null
          created_at: string | null
          dominant_foot: string | null
          height_cm: number | null
          id: string
          player_id: string | null
          shoe_size: number | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          dominant_foot?: string | null
          height_cm?: number | null
          id?: string
          player_id?: string | null
          shoe_size?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          dominant_foot?: string | null
          height_cm?: number | null
          id?: string
          player_id?: string | null
          shoe_size?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_physical_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_physical_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_physical_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_physical_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_physical_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_tracking: {
        Row: {
          confidence: number | null
          created_at: string | null
          frame_number: number | null
          id: string
          player_id: string | null
          updated_at: string | null
          video_id: string | null
          x_coord: number | null
          y_coord: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          frame_number?: number | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
          video_id?: string | null
          x_coord?: number | null
          y_coord?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          frame_number?: number | null
          id?: string
          player_id?: string | null
          updated_at?: string | null
          video_id?: string | null
          x_coord?: number | null
          y_coord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_tracking_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          created_at: string | null
          date_of_birth: string
          id: string
          name: string
          player_type: string
          squad_number: number
          team_category: string | null
          updated_at: string | null
        }
        Insert: {
          age: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          name: string
          player_type?: string
          squad_number: number
          team_category?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          name?: string
          player_type?: string
          squad_number?: number
          team_category?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      position_definitions: {
        Row: {
          abbreviation: string
          created_at: string | null
          description: string | null
          full_name: string
          id: string
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          description?: string | null
          full_name: string
          id?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          description?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      position_suitability: {
        Row: {
          calculation_date: string | null
          created_at: string | null
          id: string
          player_id: string | null
          position_id: string | null
          suitability_score: number
          updated_at: string | null
        }
        Insert: {
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          player_id?: string | null
          position_id?: string | null
          suitability_score: number
          updated_at?: string | null
        }
        Update: {
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          player_id?: string | null
          position_id?: string | null
          suitability_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "position_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "position_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "position_suitability_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "position_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_definitions: {
        Row: {
          abbreviation: string
          created_at: string | null
          description: string | null
          full_name: string
          id: string
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          description?: string | null
          full_name: string
          id?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          description?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      role_suitability: {
        Row: {
          calculation_date: string | null
          created_at: string | null
          id: string
          player_id: string | null
          role_id: string | null
          suitability_score: number
          updated_at: string | null
        }
        Insert: {
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          player_id?: string | null
          role_id?: string | null
          suitability_score: number
          updated_at?: string | null
        }
        Update: {
          calculation_date?: string | null
          created_at?: string | null
          id?: string
          player_id?: string | null
          role_id?: string | null
          suitability_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_suitability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "role_suitability_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_recordings: {
        Row: {
          created_at: string | null
          id: string
          sensor_type: string
          timestamp: number
          training_session_id: string | null
          x: number | null
          y: number | null
          z: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sensor_type: string
          timestamp: number
          training_session_id?: string | null
          x?: number | null
          y?: number | null
          z?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sensor_type?: string
          timestamp?: number
          training_session_id?: string | null
          x?: number | null
          y?: number | null
          z?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_recordings_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "ml_training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          data: Json | null
          device_id: number | null
          end_time: string | null
          id: number
          player_id: string | null
          session_type: string | null
          start_time: string
        }
        Insert: {
          data?: Json | null
          device_id?: number | null
          end_time?: string | null
          id?: number
          player_id?: string | null
          session_type?: string | null
          start_time: string
        }
        Update: {
          data?: Json | null
          device_id?: number | null
          end_time?: string | null
          id?: number
          player_id?: string | null
          session_type?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      shot_analysis: {
        Row: {
          created_at: string | null
          id: string
          is_goal: boolean | null
          location_x: number
          location_y: number
          player_id: string | null
          shot_type: string | null
          timestamp: number
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_goal?: boolean | null
          location_x: number
          location_y: number
          player_id?: string | null
          shot_type?: string | null
          timestamp: number
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_goal?: boolean | null
          location_x?: number
          location_y?: number
          player_id?: string | null
          shot_type?: string | null
          timestamp?: number
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shot_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "shot_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "shot_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_analysis_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "shot_analysis_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      team_selections: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          is_captain: boolean | null
          is_substitute: boolean | null
          performance_category: string | null
          period_id: string | null
          player_id: string
          position: string
          team_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          is_captain?: boolean | null
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id: string
          position: string
          team_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          is_captain?: boolean | null
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id?: string
          position?: string
          team_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_selections_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "event_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      team_settings: {
        Row: {
          created_at: string | null
          format: string | null
          id: string
          parent_notification_enabled: boolean | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          format?: string | null
          id?: string
          parent_notification_enabled?: boolean | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          format?: string | null
          id?: string
          parent_notification_enabled?: boolean | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tournament_team_players: {
        Row: {
          created_at: string | null
          id: string
          is_substitute: boolean | null
          performance_category: string | null
          player_id: string | null
          position: string
          tournament_team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          position: string
          tournament_team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          player_id?: string | null
          position?: string
          tournament_team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "tournament_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "tournament_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "tournament_team_players_tournament_team_id_fkey"
            columns: ["tournament_team_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          team_name: string
          tournament_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          team_name: string
          tournament_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          team_name?: string
          tournament_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          date: string
          end_time: string | null
          format: string | null
          id: string
          location: string | null
          meeting_time: string | null
          number_of_teams: number
          team_name: string | null
          time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time?: string | null
          format?: string | null
          id?: string
          location?: string | null
          meeting_time?: string | null
          number_of_teams: number
          team_name?: string | null
          time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string | null
          format?: string | null
          id?: string
          location?: string | null
          meeting_time?: string | null
          number_of_teams?: number
          team_name?: string | null
          time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_drills: {
        Row: {
          created_at: string | null
          id: string
          instructions: string | null
          session_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          session_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instructions?: string | null
          session_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_drills_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_files: {
        Row: {
          content_type: string | null
          created_at: string | null
          drill_id: string | null
          file_name: string
          file_path: string
          id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          drill_id?: string | null
          file_name: string
          file_path: string
          id?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          drill_id?: string | null
          file_name?: string
          file_path?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_files_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "training_drills"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string | null
          date: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      video_analysis: {
        Row: {
          analysis_data: Json | null
          created_at: string | null
          date: string
          duration: number | null
          id: string
          title: string
          updated_at: string | null
          video_path: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          title: string
          updated_at?: string | null
          video_path: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          video_path?: string
        }
        Relationships: []
      }
      video_annotations: {
        Row: {
          annotation_type: string
          created_at: string | null
          data: Json
          id: string
          timestamp: number
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          annotation_type: string
          created_at?: string | null
          data: Json
          id?: string
          timestamp: number
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          annotation_type?: string
          created_at?: string | null
          data?: Json
          id?: string
          timestamp?: number
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_annotations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      attribute_history: {
        Row: {
          created_at: string | null
          name: string | null
          player_id: string | null
          previous_value: number | null
        }
        Insert: {
          created_at?: string | null
          name?: string | null
          player_id?: string | null
          previous_value?: number | null
        }
        Update: {
          created_at?: string | null
          name?: string | null
          player_id?: string | null
          previous_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      available_players_by_category: {
        Row: {
          age: number | null
          created_at: string | null
          date_of_birth: string | null
          id: string | null
          name: string | null
          player_type: string | null
          squad_number: number | null
          team_category: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string | null
          name?: string | null
          player_type?: string | null
          squad_number?: number | null
          team_category?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string | null
          name?: string | null
          player_type?: string | null
          squad_number?: number | null
          team_category?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      player_fixture_stats: {
        Row: {
          captain_appearances: number | null
          fixture_history: Json | null
          motm_appearances: number | null
          player_id: string | null
          player_name: string | null
          positions_played: Json | null
          total_appearances: number | null
          total_minutes_played: number | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          completed_objectives: number | null
          improving_objectives: number | null
          name: string | null
          ongoing_objectives: number | null
          player_id: string | null
          total_objectives: number | null
        }
        Relationships: []
      }
      position_rankings: {
        Row: {
          player_id: string | null
          player_name: string | null
          position: string | null
          position_rank: number | null
          suitability_score: number | null
        }
        Relationships: []
      }
      team_performance_categories: {
        Row: {
          performance_category: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_position_suitability: {
        Args: {
          input_player_id: string
        }
        Returns: undefined
      }
      create_initial_admin: {
        Args: {
          admin_email: string
        }
        Returns: undefined
      }
      update_position_suitability: {
        Args: {
          input_player_id: string
          position_abbrev: string
          score: number
        }
        Returns: undefined
      }
    }
    Enums: {
      coach_role: "Manager" | "Coach" | "Helper"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

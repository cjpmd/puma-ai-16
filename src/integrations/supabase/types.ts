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
      attendance_notification_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          notification_type: string
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_type: string
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_notification_settings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
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
      club_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_players: number | null
          max_teams: number | null
          name: string
          price_annual: number | null
          price_monthly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          max_teams?: number | null
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          max_teams?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      club_subscriptions: {
        Row: {
          club_id: string | null
          created_at: string
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          subscription_amount: number | null
          subscription_period: string | null
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_period?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_period?: string | null
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_subscriptions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          admin_id: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          phone: string | null
          serial_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_id?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          serial_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_id?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          serial_number?: string | null
          updated_at?: string
          website?: string | null
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      deep_tracking_results: {
        Row: {
          class_name: string
          confidence: number
          created_at: string | null
          frame_number: number
          height: number
          id: string
          track_id: number
          video_id: string | null
          width: number
          x_coord: number
          y_coord: number
        }
        Insert: {
          class_name: string
          confidence: number
          created_at?: string | null
          frame_number: number
          height: number
          id?: string
          track_id: number
          video_id?: string | null
          width: number
          x_coord: number
          y_coord: number
        }
        Update: {
          class_name?: string
          confidence?: number
          created_at?: string | null
          frame_number?: number
          height?: number
          id?: string
          track_id?: number
          video_id?: string | null
          width?: number
          x_coord?: number
          y_coord?: number
        }
        Relationships: [
          {
            foreignKeyName: "deep_tracking_results_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_token: string
          device_type: string
          id: string
          last_used: string | null
          parent_id: string | null
          player_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_token: string
          device_type: string
          id?: string
          last_used?: string | null
          parent_id?: string | null
          player_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_token?: string
          device_type?: string
          id?: string
          last_used?: string | null
          parent_id?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "player_parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      event_attendance: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          parent_id: string | null
          player_id: string
          responded_by: string | null
          response_time: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          parent_id?: string | null
          player_id: string
          responded_by?: string | null
          response_time?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          parent_id?: string | null
          player_id?: string
          responded_by?: string | null
          response_time?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "player_parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
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
          team_number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          event_id: string
          event_type: string
          id?: string
          period_number: number
          team_number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          event_id?: string
          event_type?: string
          id?: string
          period_number?: number
          team_number?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fa_connection_settings: {
        Row: {
          enabled: boolean | null
          id: string
          provider: string | null
          team_id: string | null
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          provider?: string | null
          team_id?: string | null
        }
        Update: {
          enabled?: boolean | null
          id?: string
          provider?: string | null
          team_id?: string | null
        }
        Relationships: []
      }
      festival_team_players: {
        Row: {
          created_at: string | null
          festival_team_id: string | null
          id: string
          is_captain: boolean | null
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
          is_captain?: boolean | null
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
          is_captain?: boolean | null
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      fixture_team_scores: {
        Row: {
          created_at: string | null
          fixture_id: string | null
          id: string
          opponent_score: number | null
          score: number
          team_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          opponent_score?: number | null
          score: number
          team_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixture_id?: string | null
          id?: string
          opponent_score?: number | null
          score?: number
          team_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_team_scores_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      fixture_team_selections: {
        Row: {
          captain_id: string | null
          created_at: string | null
          duration: number | null
          fixture_id: string | null
          id: string
          is_captain: boolean | null
          performance_category: string | null
          period_id: string | null
          player_id: string | null
          position: string | null
          selections_data: Json | null
          team_id: string | null
          team_number: number | null
          updated_at: string | null
        }
        Insert: {
          captain_id?: string | null
          created_at?: string | null
          duration?: number | null
          fixture_id?: string | null
          id?: string
          is_captain?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id?: string | null
          position?: string | null
          selections_data?: Json | null
          team_id?: string | null
          team_number?: number | null
          updated_at?: string | null
        }
        Update: {
          captain_id?: string | null
          created_at?: string | null
          duration?: number | null
          fixture_id?: string | null
          id?: string
          is_captain?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          player_id?: string | null
          position?: string | null
          selections_data?: Json | null
          team_id?: string | null
          team_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_team_selections_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      fixture_team_times: {
        Row: {
          created_at: string | null
          end_time: string | null
          fixture_id: string | null
          id: string
          meeting_time: string | null
          performance_category: string | null
          start_time: string | null
          team_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          fixture_id?: string | null
          id?: string
          meeting_time?: string | null
          performance_category?: string | null
          start_time?: string | null
          team_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          fixture_id?: string | null
          id?: string
          meeting_time?: string | null
          performance_category?: string | null
          start_time?: string | null
          team_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_team_times_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
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
          opponent_1_score: number | null
          opponent_2_score: number | null
          outcome: string | null
          performance_category: string | null
          potm_player_id: string | null
          start_time: string | null
          team_1_score: number | null
          team_2_score: number | null
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
          opponent_1_score?: number | null
          opponent_2_score?: number | null
          outcome?: string | null
          performance_category?: string | null
          potm_player_id?: string | null
          start_time?: string | null
          team_1_score?: number | null
          team_2_score?: number | null
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
          opponent_1_score?: number | null
          opponent_2_score?: number | null
          outcome?: string | null
          performance_category?: string | null
          potm_player_id?: string | null
          start_time?: string | null
          team_1_score?: number | null
          team_2_score?: number | null
          team_name?: string
          time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey"
            columns: ["potm_player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_motm_player_id_fkey1"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_formats: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
          parameters: Json | null
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
          parameters?: Json | null
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
          parameters?: Json | null
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          notify_email: boolean | null
          notify_push: boolean | null
          notify_whatsapp: boolean | null
          parent_id: string | null
          player_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_whatsapp?: boolean | null
          parent_id?: string | null
          player_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_whatsapp?: boolean | null
          parent_id?: string | null
          player_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "player_parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
        ]
      }
      object_detections: {
        Row: {
          confidence: number
          created_at: string
          frame_time: number
          height: number
          id: string
          object_class: string
          video_id: string | null
          width: number
          x_coord: number
          y_coord: number
        }
        Insert: {
          confidence: number
          created_at?: string
          frame_time: number
          height: number
          id?: string
          object_class: string
          video_id?: string | null
          width: number
          x_coord: number
          y_coord: number
        }
        Update: {
          confidence?: number
          created_at?: string
          frame_time?: number
          height?: number
          id?: string
          object_class?: string
          video_id?: string | null
          width?: number
          x_coord?: number
          y_coord?: number
        }
        Relationships: [
          {
            foreignKeyName: "object_detections_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_linking: {
        Row: {
          created_at: string
          id: string
          parent_id: string | null
          player_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id?: string | null
          player_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string | null
          player_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_linking_player_id_fkey"
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      performance_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
          is_verified: boolean | null
          name: string
          phone: string | null
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          phone?: string | null
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      player_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          player_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          player_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      player_subscriptions: {
        Row: {
          created_at: string
          id: string
          last_payment_date: string | null
          next_payment_due: string | null
          player_id: string | null
          status: string
          subscription_amount: number | null
          subscription_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_payment_due?: string | null
          player_id?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_payment_due?: string | null
          player_id?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_subscriptions_player_id_fkey"
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      player_transfers: {
        Row: {
          created_at: string | null
          from_team_id: string | null
          id: string
          player_id: string
          reason: string | null
          status: string | null
          to_team_id: string | null
          transfer_date: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_team_id?: string | null
          id?: string
          player_id: string
          reason?: string | null
          status?: string | null
          to_team_id?: string | null
          transfer_date?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_team_id?: string | null
          id?: string
          player_id?: string
          reason?: string | null
          status?: string | null
          to_team_id?: string | null
          transfer_date?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "available_players_by_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_fixture_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_transfers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "position_rankings"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "player_transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          linking_code: string | null
          name: string
          player_type: string
          self_linked: boolean | null
          squad_number: number
          status: string | null
          team_category: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          linking_code?: string | null
          name: string
          player_type?: string
          self_linked?: boolean | null
          squad_number: number
          status?: string | null
          team_category?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age?: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          linking_code?: string | null
          name?: string
          player_type?: string
          self_linked?: boolean | null
          squad_number?: number
          status?: string | null
          team_category?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
          club_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      team_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_players: number | null
          name: string
          price_annual: number | null
          price_monthly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      team_selections: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          event_id: string
          event_type: string
          id: string
          is_substitute: boolean | null
          performance_category: string | null
          period_id: string | null
          period_number: number | null
          player_id: string
          position: string
          position_key: string | null
          team_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          event_id: string
          event_type: string
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          period_number?: number | null
          player_id: string
          position: string
          position_key?: string | null
          team_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          event_id?: string
          event_type?: string
          id?: string
          is_substitute?: boolean | null
          performance_category?: string | null
          period_id?: string | null
          period_number?: number | null
          player_id?: string
          position?: string
          position_key?: string | null
          team_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_period"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "event_periods"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
          admin_id: string | null
          attendance_colors: Json | null
          created_at: string | null
          format: string | null
          hide_scores_from_parents: boolean | null
          id: string
          parent_notification_enabled: boolean | null
          team_id: string | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          attendance_colors?: Json | null
          created_at?: string | null
          format?: string | null
          hide_scores_from_parents?: boolean | null
          id?: string
          parent_notification_enabled?: boolean | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          attendance_colors?: Json | null
          created_at?: string | null
          format?: string | null
          hide_scores_from_parents?: boolean | null
          id?: string
          parent_notification_enabled?: boolean | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          subscription_amount: number | null
          subscription_period: string | null
          subscription_plan: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_period?: string | null
          subscription_plan?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          subscription_amount?: number | null
          subscription_period?: string | null
          subscription_plan?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          admin_id: string | null
          age_group: string | null
          club_id: string | null
          contact_email: string | null
          created_at: string
          id: string
          joined_club_at: string | null
          location: string | null
          subscription_expiry: string | null
          subscription_status: string | null
          team_color: string | null
          team_logo: string | null
          team_name: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          age_group?: string | null
          club_id?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          joined_club_at?: string | null
          location?: string | null
          subscription_expiry?: string | null
          subscription_status?: string | null
          team_color?: string | null
          team_logo?: string | null
          team_name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          age_group?: string | null
          club_id?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          joined_club_at?: string | null
          location?: string | null
          subscription_expiry?: string | null
          subscription_status?: string | null
          team_color?: string | null
          team_logo?: string | null
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_team_players: {
        Row: {
          created_at: string | null
          id: string
          is_captain: boolean | null
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
          is_captain?: boolean | null
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
          is_captain?: boolean | null
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: string
          updated_at?: string
          user_id?: string | null
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
      video_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          server_url: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["video_processing_status"] | null
          updated_at: string | null
          video_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          server_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["video_processing_status"] | null
          updated_at?: string | null
          video_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          server_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["video_processing_status"] | null
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_processing_jobs_video_id_fkey"
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
            referencedRelation: "player_attendance_stats"
            referencedColumns: ["player_id"]
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
      player_attendance_stats: {
        Row: {
          attendance_rate: number | null
          attended_events: number | null
          missed_events: number | null
          pending_responses: number | null
          player_id: string | null
          player_name: string | null
          total_events: number | null
        }
        Relationships: []
      }
      player_fixture_stats: {
        Row: {
          captain_appearances: number | null
          fixture_history: Json | null
          player_id: string | null
          player_name: string | null
          positions_played: Json | null
          potm_appearances: number | null
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
      valid_attendance_status: {
        Row: {
          enumlabel: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_column_if_not_exists: {
        Args: {
          p_table_name: string
          p_column_name: string
          p_column_type: string
        }
        Returns: boolean
      }
      add_missing_columns_to_fixture_team_selections: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_position_suitability: {
        Args: { input_player_id: string }
        Returns: undefined
      }
      create_initial_admin: {
        Args: { admin_email: string }
        Returns: undefined
      }
      create_table_if_not_exists: {
        Args: { p_table_name: string; p_columns: string }
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_string: string }
        Returns: undefined
      }
      function_exists: {
        Args: { function_name: string }
        Returns: boolean
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: string[]
      }
      is_club_admin: {
        Args: { club_id: string }
        Returns: boolean
      }
      is_team_admin: {
        Args: { team_id: string }
        Returns: boolean
      }
      table_exists: {
        Args: { table_name: string }
        Returns: boolean
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
      attendance_status:
        | "PENDING"
        | "CONFIRMED"
        | "DECLINED"
        | "NOT_CONFIRMED"
        | "MAYBE"
      coach_role: "Manager" | "Coach" | "Helper"
      user_role: "admin" | "manager" | "coach" | "parent" | "globalAdmin"
      video_processing_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: [
        "PENDING",
        "CONFIRMED",
        "DECLINED",
        "NOT_CONFIRMED",
        "MAYBE",
      ],
      coach_role: ["Manager", "Coach", "Helper"],
      user_role: ["admin", "manager", "coach", "parent", "globalAdmin"],
      video_processing_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const

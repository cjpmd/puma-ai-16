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
      fixtures: {
        Row: {
          away_score: number | null
          category: string
          created_at: string | null
          date: string
          home_score: number | null
          id: string
          location: string | null
          opponent: string
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          category?: string
          created_at?: string | null
          date: string
          home_score?: number | null
          id?: string
          location?: string | null
          opponent: string
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          category?: string
          created_at?: string | null
          date?: string
          home_score?: number | null
          id?: string
          location?: string | null
          opponent?: string
          updated_at?: string | null
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
      player_objectives: {
        Row: {
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          player_id: string | null
          points: number | null
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
      players: {
        Row: {
          age: number
          created_at: string | null
          date_of_birth: string
          id: string
          name: string
          player_category: string
          player_type: string
          squad_number: number
          updated_at: string | null
        }
        Insert: {
          age: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          name: string
          player_category: string
          player_type?: string
          squad_number: number
          updated_at?: string | null
        }
        Update: {
          age?: number
          created_at?: string | null
          date_of_birth?: string
          id?: string
          name?: string
          player_category?: string
          player_type?: string
          squad_number?: number
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
    }
    Views: {
      attribute_history: {
        Row: {
          created_at: string | null
          name: string | null
          player_id: string | null
          previous_value: number | null
        }
        Relationships: [
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

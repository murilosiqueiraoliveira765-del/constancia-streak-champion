export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          checkin_date: string
          created_at?: string
          id?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_progress: {
        Row: {
          exercise_name: string
          id: string
          max_reps: number | null
          max_time_seconds: number | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          exercise_name: string
          id?: string
          max_reps?: number | null
          max_time_seconds?: number | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          exercise_name?: string
          id?: string
          max_reps?: number | null
          max_time_seconds?: number | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_diary: {
        Row: {
          ai_analysis: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          logged_at: string
          meal_type: string
          rating: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          logged_at?: string
          meal_type: string
          rating?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          logged_at?: string
          meal_type?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_plan: string | null
          current_streak: number | null
          id: string
          longest_streak: number | null
          name: string | null
          plan_start_date: string | null
          total_workouts: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_plan?: string | null
          current_streak?: number | null
          id: string
          longest_streak?: number | null
          name?: string | null
          plan_start_date?: string | null
          total_workouts?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_plan?: string | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          name?: string | null
          plan_start_date?: string | null
          total_workouts?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reminder_confirmations: {
        Row: {
          confirmed_at: string
          id: string
          reminder_type: string
          scheduled_for: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string
          id?: string
          reminder_type: string
          scheduled_for: string
          user_id: string
        }
        Update: {
          confirmed_at?: string
          id?: string
          reminder_type?: string
          scheduled_for?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          breakfast_time: string | null
          created_at: string
          daily_water_goal_ml: number
          dinner_time: string | null
          id: string
          lunch_time: string | null
          meal_reminder_enabled: boolean
          snack_time: string | null
          updated_at: string
          user_id: string
          water_reminder_enabled: boolean
          water_reminder_end_hour: number
          water_reminder_interval_minutes: number
          water_reminder_start_hour: number
        }
        Insert: {
          breakfast_time?: string | null
          created_at?: string
          daily_water_goal_ml?: number
          dinner_time?: string | null
          id?: string
          lunch_time?: string | null
          meal_reminder_enabled?: boolean
          snack_time?: string | null
          updated_at?: string
          user_id: string
          water_reminder_enabled?: boolean
          water_reminder_end_hour?: number
          water_reminder_interval_minutes?: number
          water_reminder_start_hour?: number
        }
        Update: {
          breakfast_time?: string | null
          created_at?: string
          daily_water_goal_ml?: number
          dinner_time?: string | null
          id?: string
          lunch_time?: string | null
          meal_reminder_enabled?: boolean
          snack_time?: string | null
          updated_at?: string
          user_id?: string
          water_reminder_enabled?: boolean
          water_reminder_end_hour?: number
          water_reminder_interval_minutes?: number
          water_reminder_start_hour?: number
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration_seconds: number
          exercises_completed: number
          id: string
          user_id: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          exercises_completed: number
          id?: string
          user_id: string
          workout_type: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          exercises_completed?: number
          id?: string
          user_id?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

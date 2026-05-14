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
      content_items: {
        Row: {
          created_at: string
          current_section: string | null
          generated_content: string | null
          generated_title: string | null
          meta_description: string | null
          h1: string
          h2_list: string[]
          h3_list: string[] | null
          id: string
          main_keyword: string
          secondary_keywords: string[] | null
          sections_completed: number | null
          status: string
          target_country: string
          tone: string
          total_sections: number | null
          updated_at: string
          user_id: string
          word_count_target: number
          internal_links: string[] | null
          featured_image_url: string | null
          generate_image: boolean | null
          details: string | null
          scheduled_date: string | null
          published_url: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          current_section?: string | null
          generated_content?: string | null
          generated_title?: string | null
          meta_description?: string | null
          h1: string
          h2_list?: string[]
          h3_list?: string[] | null
          id?: string
          main_keyword: string
          secondary_keywords?: string[] | null
          sections_completed?: number | null
          status?: string
          target_country?: string
          tone?: string
          total_sections?: number | null
          updated_at?: string
          user_id: string
          word_count_target?: number
          internal_links?: string[] | null
          featured_image_url?: string | null
          generate_image?: boolean | null
          details?: string | null
          scheduled_date?: string | null
          published_url?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          current_section?: string | null
          generated_content?: string | null
          generated_title?: string | null
          meta_description?: string | null
          h1?: string
          h2_list?: string[]
          h3_list?: string[] | null
          id?: string
          main_keyword?: string
          secondary_keywords?: string[] | null
          sections_completed?: number | null
          status?: string
          target_country?: string
          tone?: string
          total_sections?: number | null
          updated_at?: string
          user_id?: string
          word_count_target?: number
          internal_links?: string[] | null
          featured_image_url?: string | null
          generate_image?: boolean | null
          details?: string | null
          scheduled_date?: string | null
          published_url?: string | null
          project_id?: string
        }
        Relationships: []
      }
      blog_images: {
        Row: {
          id: string
          content_id: string
          user_id: string
          image_url: string
          prompt: string | null
          image_type: string
          section_heading: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          user_id: string
          image_url: string
          prompt?: string | null
          image_type?: string
          section_heading?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          user_id?: string
          image_url?: string
          prompt?: string | null
          image_type?: string
          section_heading?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_images_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          }
        ]
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

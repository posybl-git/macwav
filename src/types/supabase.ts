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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          is_priority: boolean
          credit_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: string
          is_priority?: boolean
          credit_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          is_priority?: boolean
          credit_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          user_id: string
          song_name: string
          package_tier: string
          current_stage: string
          status: string
          revision_count: number
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_name: string
          package_tier: string
          current_stage?: string
          status?: string
          revision_count?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_name?: string
          package_tier?: string
          current_stage?: string
          status?: string
          revision_count?: number
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deliverables: {
        Row: {
          id: string
          song_id: string
          title: string
          status: string
          tier_required: string
          sort_order: number
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          title: string
          status?: string
          tier_required: string
          sort_order: number
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          title?: string
          status?: string
          tier_required?: string
          sort_order?: number
          completed_at?: string | null
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          balance_after: number
          description: string
          song_id: string | null
          stripe_payment_id: string | null
          paypal_order_id: string | null
          admin_id: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          balance_after: number
          description: string
          song_id?: string | null
          stripe_payment_id?: string | null
          paypal_order_id?: string | null
          admin_id?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          balance_after?: number
          description?: string
          song_id?: string | null
          stripe_payment_id?: string | null
          paypal_order_id?: string | null
          admin_id?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      schedule_slots: {
        Row: {
          id: string
          start_time: string
          end_time: string
          is_available: boolean
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id?: string
          start_time: string
          end_time: string
          is_available?: boolean
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          is_premium?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          slot_id: string
          session_type: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slot_id: string
          session_type: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slot_id?: string
          session_type?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_credit_purchase: {
        Args: {
          p_user_id: string
          p_amount: number
          p_stripe_payment_id: string
          p_description: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

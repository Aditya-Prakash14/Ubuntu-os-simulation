export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          phone: string | null
          created_at: string
          last_login: string | null
          preferences: Json | null
          home_directory: string
          shell: string
          uid: number
          gid: number
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          phone?: string | null
          created_at?: string
          last_login?: string | null
          preferences?: Json | null
          home_directory: string
          shell?: string
          uid?: number
          gid?: number
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          phone?: string | null
          created_at?: string
          last_login?: string | null
          preferences?: Json | null
          home_directory?: string
          shell?: string
          uid?: number
          gid?: number
        }
      }
      file_system: {
        Row: {
          id: string
          user_id: string
          path: string
          name: string
          type: string
          content: string
          metadata: Json | null
          permissions: string
          owner_uid: number
          group_gid: number
          size: number
          created_at: string
          modified_at: string
          accessed_at: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          path: string
          name: string
          type: string
          content?: string
          metadata?: Json | null
          permissions?: string
          owner_uid?: number
          group_gid?: number
          size?: number
          created_at?: string
          modified_at?: string
          accessed_at?: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          path?: string
          name?: string
          type?: string
          content?: string
          metadata?: Json | null
          permissions?: string
          owner_uid?: number
          group_gid?: number
          size?: number
          created_at?: string
          modified_at?: string
          accessed_at?: string
          parent_id?: string | null
        }
      }
      terminal_sessions: {
        Row: {
          id: string
          user_id: string
          session_name: string
          current_directory: string
          environment_vars: Json | null
          command_history: string
          session_state: Json | null
          is_active: boolean
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          session_name?: string
          current_directory?: string
          environment_vars?: Json | null
          command_history?: string
          session_state?: Json | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_name?: string
          current_directory?: string
          environment_vars?: Json | null
          command_history?: string
          session_state?: Json | null
          is_active?: boolean
          created_at?: string
          last_activity?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          category: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          name: string
          version: string
          description: string
          metadata: Json | null
          is_installed: boolean
          package_name: string
          dependencies: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          description: string
          metadata?: Json | null
          is_installed?: boolean
          package_name: string
          dependencies?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string
          metadata?: Json | null
          is_installed?: boolean
          package_name?: string
          dependencies?: Json | null
          created_at?: string
        }
      }
      user_applications: {
        Row: {
          id: string
          user_id: string
          application_id: string
          is_installed: boolean
          settings: Json | null
          window_state: Json | null
          installed_at: string
          last_used: string | null
        }
        Insert: {
          id?: string
          user_id: string
          application_id: string
          is_installed?: boolean
          settings?: Json | null
          window_state?: Json | null
          installed_at?: string
          last_used?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          is_installed?: boolean
          settings?: Json | null
          window_state?: Json | null
          installed_at?: string
          last_used?: string | null
        }
      }
      shared_workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string
          permissions: Json | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description: string
          permissions?: Json | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string
          permissions?: Json | null
          is_public?: boolean
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          permissions: Json | null
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: string
          permissions?: Json | null
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: string
          permissions?: Json | null
          joined_at?: string
        }
      }
      system_logs: {
        Row: {
          id: string
          user_id: string
          log_type: string
          message: string
          metadata: Json | null
          severity: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_type: string
          message: string
          metadata?: Json | null
          severity: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_type?: string
          message?: string
          metadata?: Json | null
          severity?: string
          created_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          name: string
          version: string
          description: string
          metadata: Json | null
          category: string
          dependencies: Json | null
          size: number
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          description: string
          metadata?: Json | null
          category: string
          dependencies?: Json | null
          size: number
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string
          metadata?: Json | null
          category?: string
          dependencies?: Json | null
          size?: number
          is_available?: boolean
          created_at?: string
        }
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

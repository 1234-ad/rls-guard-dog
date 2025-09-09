export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'teacher' | 'admin'
export type AssignmentStatus = 'pending' | 'submitted' | 'graded'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          description: string | null
          teacher_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          teacher_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          teacher_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      classroom_enrollments: {
        Row: {
          id: string
          classroom_id: string
          user_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          classroom_id: string
          user_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          classroom_id?: string
          user_id?: string
          enrolled_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          classroom_id: string
          title: string
          description: string | null
          due_date: string | null
          max_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          classroom_id: string
          title: string
          description?: string | null
          due_date?: string | null
          max_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          classroom_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          max_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          assignment_id: string
          status: AssignmentStatus
          submission_text: string | null
          points_earned: number
          feedback: string | null
          submitted_at: string | null
          graded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assignment_id: string
          status?: AssignmentStatus
          submission_text?: string | null
          points_earned?: number
          feedback?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assignment_id?: string
          status?: AssignmentStatus
          submission_text?: string | null
          points_earned?: number
          feedback?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_teacher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_student_access: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      validate_teacher_classroom_access: {
        Args: {
          target_classroom_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      assignment_status: AssignmentStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Extended types for application use
export interface UserWithProfile extends Database['public']['Tables']['users']['Row'] {
  // Add any additional profile fields here
}

export interface ClassroomWithTeacher extends Database['public']['Tables']['classrooms']['Row'] {
  teacher: Database['public']['Tables']['users']['Row']
  enrollment_count?: number
}

export interface AssignmentWithClassroom extends Database['public']['Tables']['assignments']['Row'] {
  classroom: Database['public']['Tables']['classrooms']['Row']
}

export interface ProgressWithDetails extends Database['public']['Tables']['progress']['Row'] {
  assignment: Database['public']['Tables']['assignments']['Row']
  user: Database['public']['Tables']['users']['Row']
  classroom?: Database['public']['Tables']['classrooms']['Row']
}
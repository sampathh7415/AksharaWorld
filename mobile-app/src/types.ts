import { AuthResponse as SupabaseAuthResponse } from '@supabase/supabase-js';

export interface SignUpCredentials {
  email: string;
  password?: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: SupabaseAuthResponse['data'];
}

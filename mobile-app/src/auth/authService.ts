import { supabase } from '../config/supabaseClient';
import { SignUpCredentials, SignInCredentials, AuthResponse } from '../types';

/**
 * Register a new user in Supabase Auth and automatically trigger profile creation.
 */
export async function signUpUser(credentials: SignUpCredentials): Promise<AuthResponse> {
  const { email, password, username, fullName, avatarUrl } = credentials;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Log in an existing user and cache their session in SecureStore.
 */
export async function signInUser(credentials: SignInCredentials): Promise<AuthResponse> {
  const { email, password } = credentials;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Clear the session from SecureStore and log the user out.
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Retrieve the active session configuration.
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
}

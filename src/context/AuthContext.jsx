import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!error && initialSession) {
        setSession(initialSession);
        setUser(initialSession.user ?? null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase client belum dikonfigurasi.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // Register with email and password
  const register = useCallback(async (email, password, displayName = 'Pelajar') => {
    if (!supabase) throw new Error('Supabase client belum dikonfigurasi.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          avatar_emoji: '🎓',
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email) => {
    if (!supabase) throw new Error('Supabase client belum dikonfigurasi.');
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  }, []);

  // Update password with new password (after following reset link)
  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) throw new Error('Supabase client belum dikonfigurasi.');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }, []);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

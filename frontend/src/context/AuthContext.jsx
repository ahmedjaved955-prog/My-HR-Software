import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, role, full_name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, role, full_name')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Failed to load user profile', error);
    }

    setUser({
      id: authUser.id,
      email: authUser.email,
      role: profile?.role || 'EMPLOYEE',
      full_name: profile?.full_name || authUser.email,
    });
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

  const signup = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    // Depending on email confirmation settings, user may need to confirm email before being fully active.
    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

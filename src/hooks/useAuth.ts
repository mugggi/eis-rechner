import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Ungültige E-Mail oder Passwort');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('E-Mail noch nicht bestätigt. Bitte überprüfen Sie Ihr Postfach.');
        } else {
          throw error;
        }
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.');
        } else {
          throw error;
        }
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Only attempt to sign out if there's an active session
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      // If no session exists, we're already signed out, so just return
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abmeldung fehlgeschlagen');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort-Reset fehlgeschlagen');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
}
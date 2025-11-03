import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error.message);
      setUserProfile(null);
    } else {
      setUserProfile(data);
    }
    return data;
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      }
      setLoading(false);
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      // Only set loading to false after the first check
      if (loading) setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, loading]);

  const signUp = async (email, password, metaData) => {
    // First, sign up the user in auth.users
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Supabase signUp error:', signUpError);
      return { user: null, error: signUpError };
    }
    
    if (!authData.user) {
        const err = new Error("Kayıt sonrası kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.");
        console.error(err);
        return { user: null, error: err };
    }

    // If sign up is successful, call the RPC function to create clinic and profile
    const { error: rpcError } = await supabase.rpc('create_clinic_and_assign_owner', {
      p_clinic_name: metaData.clinic_name,
      p_user_id: authData.user.id,
      p_full_name: metaData.full_name,
      p_role: metaData.role,
    });

    if (rpcError) {
      console.error('RPC create_clinic_and_assign_owner error:', rpcError);
      // Clean up the created user if the profile/clinic setup fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { user: null, error: rpcError };
    }

    return { user: authData.user, error: null };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Çıkış Başarısız',
        description: error.message,
      });
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
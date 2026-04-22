import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext();

// Build a user object from Supabase session + optional DB profile
const buildUser = (authUser, profile = null) => ({
  id: authUser.id,
  email: authUser.email,
  user_metadata: {
    name:
      profile?.name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0],
  },
  role:
    profile?.role ||
    authUser.user_metadata?.role ||
    'Student',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount — use metadata first, DB only as fallback
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const meta = session.user.user_metadata || {};
          // If role is already in metadata (set during signup), skip DB queries
          if (meta.role) {
            setUser(buildUser(session.user));
          } else {
            // Legacy accounts: fetch from DB once
            const [adminRes, userRes] = await Promise.all([
              supabase.from('admin').select('name').eq('email', session.user.email).maybeSingle(),
              supabase.from('users').select('name, role').eq('email', session.user.email).maybeSingle()
            ]);
            setUser(buildUser(session.user, adminRes.data || userRes.data));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Keep session in sync across tabs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async ({ email, password }) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      return { error: { message: authError.message } };
    }

    const meta = authData.user.user_metadata || {};

    if (meta.role) {
      // Fast path: role already baked into metadata — no extra DB call needed
      setUser(buildUser(authData.user));
      return { error: null };
    }

    // Fallback for legacy accounts without metadata
    const [adminRes, userRes] = await Promise.all([
      supabase.from('admin').select('name').eq('email', authData.user.email).maybeSingle(),
      supabase.from('users').select('name, role').eq('email', authData.user.email).maybeSingle()
    ]);

    setUser(buildUser(authData.user, adminRes.data || userRes.data));
    return { error: null };
  };

  const signUp = async ({ email, password, name, rollNo, phone, department, dob, year, gender }) => {
    // Bake name & role into Supabase auth metadata so future logins skip DB queries
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'Student' }
      }
    });

    if (authError) {
      return { error: { message: authError.message } };
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert([{
        user_id: authData.user.id,
        email,
        name,
        password, // stored for legacy admin lookup
        role: 'Student',
        phone: phone || null,
        department: department || null,
        roll_no: rollNo || null,
        dob: dob || null,
        year: year || null,
        gender: gender || null
      }]);

      if (profileError) {
        console.error('Profile creation error details:', profileError);
        return { error: { message: `Database error: ${profileError.message || profileError.details}` } };
      }
    }
    return { error: null };
  };

  const addAdmin = async ({ name, email, password }) => {
    // Bake name & role into metadata so admin logins skip DB queries too
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'Admin' }
      }
    });

    if (authError) {
      return { error: { message: authError.message } };
    }

    if (authData.user) {
      const { error: adminError } = await supabase.from('admin').insert([{
        admin_id: authData.user.id,
        email,
        name,
        password
      }]);

      if (adminError) {
        console.error('Admin creation database error:', adminError);
        return { error: { message: `Database Error: ${adminError.message}` } };
      }
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, loading, signIn, signUp, addAdmin, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

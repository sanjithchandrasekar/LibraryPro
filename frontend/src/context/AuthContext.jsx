import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Optional: check session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch both admin and user profiles concurrently to save loading time
        const [adminRes, userRes] = await Promise.all([
          supabase.from('admin').select('name').eq('email', session.user.email).single(),
          supabase.from('users').select('name, role').eq('email', session.user.email).single()
        ]);

        if (adminRes.data) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            user_metadata: { name: adminRes.data.name },
            role: 'Admin'
          });
          return;
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: { name: userRes.data?.name || session.user.user_metadata?.name },
          role: userRes.data?.role || session.user.user_metadata?.role || 'Student'
        });
      }
    };
    checkSession();
  }, []);

  const signIn = async ({ email, password }) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      return { error: { message: authError.message } };
    }
    
    // Fetch both admin and user profiles concurrently to slice latency in half
    const [adminRes, userRes] = await Promise.all([
      supabase.from('admin').select('name').eq('email', authData.user.email).single(),
      supabase.from('users').select('name, role').eq('email', authData.user.email).single()
    ]);
    
    if (adminRes.data) {
      setUser({
        id: authData.user.id,
        email: authData.user.email,
        user_metadata: { name: adminRes.data.name },
        role: 'Admin'
      });
      return { error: null };
    }

    const profile = userRes.data;
    const loggedUser = {
      id: authData.user.id,
      email: authData.user.email,
      user_metadata: { name: profile?.name || authData.user.user_metadata?.name },
      role: profile?.role || authData.user.user_metadata?.role || 'Student'
    };
    
    setUser(loggedUser);
    return { error: null };
  };

  const signUp = async ({ email, password, name, rollNo, phone, department, dob, year, gender }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'Student' } // storing in auth metadata as fallback
      }
    });

    if (authError) {
      return { error: { message: authError.message } };
    }
    
    // Insert into custom users table according to YOUR specific schema
    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert([{
        user_id: authData.user.id,
        email: email,
        name: name,
        password: password, // <-- Now storing the password in the table
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

    // Insert into 'admin' table
    if (authData.user) {
      const { error: adminError } = await supabase.from('admin').insert([{
        admin_id: authData.user.id, // Ensure your schema is admin_id (or change back to staff_id if it's still staff_id)
        email,
        name,
        password // <-- Storing the password in the admin table
      }]);
      if (adminError) {
        console.warn('Admin creation warning:', adminError);
      }
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, signIn, signUp, addAdmin, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

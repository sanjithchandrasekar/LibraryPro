import { createContext, useState } from 'react';

export const AuthContext = createContext();

// Mock user for UI development - no Supabase required
const MOCK_USER = {
  id: 'staff-001',
  email: 'admin@library.com',
  user_metadata: { name: 'Admin' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(MOCK_USER); // Auto-logged in for UI dev

  const signIn = async ({ email, password }) => {
    // TODO: Replace with real Supabase auth
    if (email && password) {
      setUser(MOCK_USER);
      return { error: null };
    }
    return { error: { message: 'Invalid credentials' } };
  };

  const signOut = () => {
    setUser(null);
  };

  const value = { user, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

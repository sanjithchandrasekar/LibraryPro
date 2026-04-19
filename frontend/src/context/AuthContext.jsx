import { createContext, useState } from 'react';

export const AuthContext = createContext();

// Staff credentials — matches the ER diagram (Staff table: email, password)
const STAFF_CREDENTIALS = [
  { staff_id: 'staff-001', email: 'admin@library.com', password: 'admin123', name: 'Admin' },
  { staff_id: 'staff-002', email: 'librarian@library.com', password: 'lib123', name: 'Librarian' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // No auto-login; must authenticate

  const signIn = async ({ email, password }) => {
    // Validate credentials against staff table (ER diagram: Staff has email + password)
    const staff = STAFF_CREDENTIALS.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
    );
    if (staff) {
      setUser({
        id: staff.staff_id,
        email: staff.email,
        user_metadata: { name: staff.name }
      });
      return { error: null };
    }
    return { error: { message: 'Invalid email or password. Please try again.' } };
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

import { createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const STAFF_CREDENTIALS = [
  { staff_id: 'staff-001', email: 'admin@library.com', password: 'admin123', name: 'Admin' },
  { staff_id: 'staff-002', email: 'librarian@library.com', password: 'lib123', name: 'Librarian' },
];

const STUDENT_CREDENTIALS = [
  { user_id: 'u1', email: 'alice@university.edu', password: 'student123', name: 'Alice Johnson', role: 'Student' },
  { user_id: 'u2', email: 'bob@university.edu', password: 'student123', name: 'Bob Smith', role: 'Faculty' },
  { user_id: 'u3', email: 'student@library.com', password: 'student123', name: 'Demo Student', role: 'Student' } // Demo account
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
        user_metadata: { name: staff.name },
        role: 'Admin'
      });
      return { error: null };
    }
    
    // Validate against student/user credentials
    const student = STUDENT_CREDENTIALS.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
    );
    if (student) {
      setUser({
        id: student.user_id,
        email: student.email,
        user_metadata: { name: student.name },
        role: student.role
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

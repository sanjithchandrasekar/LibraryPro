import { createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const STAFF_CREDENTIALS = [
  { staff_id: 'staff-001', email: 'admin@library.com', password: 'admin123', name: 'Admin' },
  { staff_id: 'staff-002', email: 'librarian@library.com', password: 'lib123', name: 'Librarian' },
];

// In-memory student store; registered students get appended here at runtime
const STUDENT_CREDENTIALS = [
  { user_id: 'u1', email: 'alice@university.edu', password: 'student123', name: 'Alice Johnson', role: 'Student', rollNo: 'CS20B001', department: 'Computer Science & Engineering' },
  { user_id: 'u2', email: 'bob@university.edu', password: 'student123', name: 'Bob Smith', role: 'Faculty', rollNo: 'IT20B002', department: 'Information Technology' },
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

  const signUp = async ({ email, password, name, rollNo, phone, department, dob, year, gender }) => {
    // Check for duplicate email
    const allEmails = [
      ...STAFF_CREDENTIALS.map(s => s.email.toLowerCase()),
      ...STUDENT_CREDENTIALS.map(s => s.email.toLowerCase()),
    ];
    if (allEmails.includes(email.toLowerCase())) {
      return { error: { message: 'An account with this email already exists.' } };
    }
    // Register new student
    const newStudent = {
      user_id: `u-${Date.now()}`,
      email,
      password,
      name,
      rollNo,
      phone,
      department,
      dob,
      year,
      gender,
      role: 'Student',
    };
    STUDENT_CREDENTIALS.push(newStudent);
    return { error: null };
  };

  const addAdmin = async ({ name, email, password }) => {
    const allEmails = [
      ...STAFF_CREDENTIALS.map(s => s.email.toLowerCase()),
      ...STUDENT_CREDENTIALS.map(s => s.email.toLowerCase()),
    ];
    if (allEmails.includes(email.toLowerCase())) {
      return { error: { message: 'An account with this email already exists.' } };
    }
    const newStaff = {
      staff_id: `staff-${Date.now()}`,
      email,
      password,
      name,
    };
    STAFF_CREDENTIALS.push(newStaff);
    return { error: null };
  };

  const signOut = () => {
    setUser(null);
  };

  const value = { user, signIn, signUp, addAdmin, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import StudentSignup from './pages/StudentSignup';
import CreateAdmin from './pages/CreateAdmin';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Issues from './pages/Issues';
import Reports from './pages/Reports';
import TestConnection from './pages/TestConnection';

// Full-screen auth loader — shown while the session is being read from Supabase
const AuthLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: 'hsl(var(--background, 220 33% 98%))'
  }}>
    <div style={{
      width: 40, height: 40, border: '3px solid rgba(139,92,246,0.2)',
      borderTopColor: '#8b5cf6', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user, loading } = useAuth();

  // While session is resolving, show loader on public routes to avoid flicker
  if (loading) return <AuthLoader />;

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/test" element={<TestConnection />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <StudentSignup />} />
          <Route path="/create-admin" element={user && user.role === 'Admin' ? <Navigate to="/" replace /> : <CreateAdmin />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="users" element={<Users />} />
            <Route path="issues" element={<Issues />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

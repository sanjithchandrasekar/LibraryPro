import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookMarked, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('admin@library.com');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: err } = await signIn({ email, password });
      if (err) throw err;
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 80%, #6d28d9 100%)' }}>

        {/* Animated blobs */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full opacity-10 blur-2xl"
          style={{ background: 'radial-gradient(circle, #f0abfc, transparent 70%)' }} />

        {/* Grid decoration */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Logo */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <BookMarked size={24} className="text-white" />
          </div>
          <div>
            <span className="text-white font-black text-2xl tracking-tight">Library<span className="text-violet-300">Pro</span></span>
            <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mt-0.5">Management System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-white/80 text-xs font-semibold">
              <Sparkles size={12} className="text-violet-300" />
              Library Management System v1.0
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Your Library,<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
                Under Control.
              </span>
            </h2>
            <p className="text-white/55 text-lg leading-relaxed max-w-sm">
              Manage books, track borrowings, calculate fines, and generate reports — all in one clean interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['8+', 'Book Titles'],
              ['5+', 'Active Members'],
              ['4', 'Active Issues'],
              ['₹20', 'Fines Collected'],
            ].map(([v, l]) => (
              <div key={l} className="bg-white/8 border border-white/10 p-5 rounded-2xl backdrop-blur-sm hover:bg-white/12 transition-colors">
                <p className="text-3xl font-black text-white">{v}</p>
                <p className="text-xs text-white/45 mt-1.5 font-semibold tracking-wide uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/25 text-xs font-medium">© 2026 LibraryPro · Built with React + Supabase</p>
        </div>
      </div>

      {/* Right panel: Form */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookMarked size={20} className="text-white" />
            </div>
            <span className="font-black text-xl">Library<span className="text-primary">Pro</span></span>
          </div>

          <div className="mb-9">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Sign In</h1>
            <p className="text-muted-foreground mt-2.5 text-base leading-relaxed">Use your staff credentials to access the dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-2xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@library.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-foreground/80">Password</label>
                <button type="button" className="text-xs text-primary hover:text-primary/70 font-semibold transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password-input"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-5 bg-primary/5 border border-primary/15 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-primary" />
              <p className="text-xs font-black text-primary uppercase tracking-widest">Demo Credentials</p>
            </div>
            <p className="text-sm font-mono text-foreground font-semibold">admin@library.com / admin123</p>
            <p className="text-xs text-muted-foreground mt-1.5">Pre-filled for your convenience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

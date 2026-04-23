import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookMarked, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { BtnSpinner } from '../components/common/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast.success('System Access Granted');
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Refined Global Background */}
      <div className="mesh-gradient-refined">
        <div className="mesh-blob-refined mesh-blob-1" />
        <div className="mesh-blob-refined mesh-blob-2" />
        <div className="mesh-blob-refined mesh-blob-3" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-indigo-500/20 mb-6 group cursor-default">
            <BookMarked size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            Library<span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-bold tracking-widest uppercase text-[10px]">Enterprise Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass-premium rounded-[3rem] p-8 lg:p-11 relative overflow-hidden group border-none shadow-2xl">
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black text-foreground tracking-tighter">Sign In</h2>
              <p className="text-muted-foreground font-semibold text-sm mt-2 opacity-80">Sign in as a Student or Administrator</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">!</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field !pl-12 py-4 bg-muted/20"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">Password</label>
                  <button type="button" className="text-[10px] font-black text-primary hover:opacity-70 transition-opacity uppercase tracking-widest">Forgot?</button>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field !pl-12 !pr-12 py-4 bg-muted/20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4.5 text-base mt-2 shadow-indigo-500/25 active:scale-95 transition-all"
              >
                {loading ? (
                  <BtnSpinner />
                ) : (
                  <span className="flex items-center gap-2">Sign In to Dashboard <ArrowRight size={18} /></span>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-xs font-bold text-muted-foreground">
              New student?{' '}
              <Link
                to="/signup"
                className="text-primary hover:opacity-70 transition-opacity font-black underline underline-offset-2"
              >
                Create an account
              </Link>
            </p>

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center flex items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={12} />
            v1.0.4 Release
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">© 2026 LibraryPro</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

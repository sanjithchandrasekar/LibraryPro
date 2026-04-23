import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ShieldCheck, User, Mail, Lock, Eye, EyeOff,
  KeyRound, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, ShieldX
} from 'lucide-react';
import { toast } from 'react-toastify';
import { BtnSpinner } from '../components/common/Loader';

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
// Only this email address is allowed to create new admin accounts.
const SUPER_ADMIN_EMAIL = 'sanjithchandrasekar03@gmail.com';

// ─── SECRET MANAGEMENT KEY ────────────────────────────────────────────────────
const MANAGEMENT_SECRET_KEY = 'library-pro-dbms';

const CreateAdmin = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { addAdmin, user } = useAuth();
  const navigate = useNavigate();

  // ── Super admin gate ──────────────────────────────────────────────────────
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  // Blocked screen for non-super admins
  if (user && !isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-6">
        <div className="glass-premium rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-6 shadow-2xl border border-red-500/20">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
            <ShieldX size={40} className="text-red-500" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Access Restricted</h2>
            <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
              Only the <span className="text-foreground font-black">Main Administrator</span> can create new admin accounts.
            </p>
            <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">
              Contact: {SUPER_ADMIN_EMAIL}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/60" />

          {/* Sub-text */}
          <p className="text-xs text-muted-foreground font-bold">
            Your account does not have permission to perform this action. Please reach out to the main administrator.
          </p>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="btn-primary w-full justify-center py-3.5"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (form.secretKey !== MANAGEMENT_SECRET_KEY)
      return 'Invalid management secret key. Please contact your system administrator.';
    if (!form.name.trim()) return 'Admin name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'A valid email address is required.';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const { error: err } = await addAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (err) throw err;
      setSuccess(true);
      toast.success(`Admin "${form.name}" created successfully!`);
    } catch (err) {
      setError(err?.message || 'Failed to create admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <div className="glass-premium rounded-[2.5rem] p-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Admin Created!</h2>
            <p className="text-muted-foreground font-semibold text-sm mt-2">
              <span className="text-foreground font-black">{form.name}</span> ({form.email}) can now sign in as an Administrator.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setForm({ name: '', email: '', password: '', confirmPassword: '', secretKey: '' }); setSuccess(false); }}
              className="flex-1 py-3.5 rounded-2xl border border-border font-black text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              Add Another
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 btn-primary justify-center py-3.5 text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ArrowLeft size={16} />
        </div>
        Back
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Create Admin Account</h1>
          <p className="text-muted-foreground font-semibold text-sm">
            Requires the management secret key to proceed
          </p>
        </div>
      </div>

      {/* Secret Key Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
          Admin creation is restricted to authorized management personnel only. You must enter the <span className="font-black">Management Secret Key</span> to unlock this form. Keep this key confidential.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-premium rounded-[2.5rem] p-8 lg:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">!</div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Management Secret Key */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">
              Management Secret Key <span className="text-red-500">*</span>
            </label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-500 z-10">
                <KeyRound size={16} />
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                name="secretKey"
                value={form.secretKey}
                onChange={handleChange}
                className="input-field !pl-10 !pr-10 py-3.5 border-amber-500/30 focus:ring-amber-500/30 focus:border-amber-500/40"
                placeholder="Enter management secret key"
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="border-t border-border/40 pt-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-5 opacity-60">New Administrator Details</p>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">Full Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors z-10">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="e.g. Dr. Ramesh Kumar"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors z-10">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="admin@library.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors z-10">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10 py-3.5"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">Confirm Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors z-10">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10 py-3.5"
                    placeholder="Re-enter password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-base mt-2 shadow-indigo-500/25"
          >
            {loading ? (
              <BtnSpinner />
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} /> Create Administrator Account
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Key hint for dev */}
      <p className="text-center text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">
        Contact system management for the secret key
      </p>
    </div>
  );
};

export default CreateAdmin;

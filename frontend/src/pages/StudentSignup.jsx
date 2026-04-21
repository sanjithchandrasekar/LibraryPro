import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BookMarked, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Phone, GraduationCap, Hash, Calendar, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'MBA',
  'MCA',
  'Other',
];

const StudentSignup = () => {
  const [form, setForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    dob: '',
    year: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.rollNo.trim()) return 'Roll Number is required.';
    if (!form.name.trim()) return 'Full Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'A valid email address is required.';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      return 'A valid 10-digit phone number is required.';
    if (!form.department) return 'Department is required.';
    if (!form.dob) return 'Date of Birth is required.';
    if (!form.year) return 'Year of Study is required.';
    if (!form.gender) return 'Gender is required.';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const { error: err } = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        rollNo: form.rollNo,
        phone: form.phone,
        department: form.department,
        dob: form.dob,
        year: form.year,
        gender: form.gender,
      });
      if (err) throw err;
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">
        {label}
      </label>
      <div className="relative group/input">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors z-10">
          <Icon size={16} />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/3 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500 relative z-10 py-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-indigo-500/20 mb-5">
            <BookMarked size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">
            Library<span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground mt-1.5 font-bold tracking-widest uppercase text-[10px]">
            Student Registration
          </p>
        </div>

        {/* Card */}
        <div className="glass-premium rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden border-none shadow-2xl">
          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-foreground tracking-tighter">Create Account</h2>
              <p className="text-muted-foreground font-semibold text-sm mt-1.5 opacity-80">
                Fill in your details to access the student dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 font-black">!</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Roll No + Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWrapper label="Roll Number" icon={Hash}>
                  <input
                    type="text"
                    name="rollNo"
                    value={form.rollNo}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="e.g. CS22B001"
                    required
                  />
                </InputWrapper>
                <InputWrapper label="Full Name" icon={User}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="Your full name"
                    required
                  />
                </InputWrapper>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWrapper label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="you@university.edu"
                    required
                  />
                </InputWrapper>
                <InputWrapper label="Phone Number" icon={Phone}>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                  />
                </InputWrapper>
              </div>

              {/* Row 3: Department (full width) */}
              <InputWrapper label="Department" icon={GraduationCap}>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="input-field !pl-10 py-3.5 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </InputWrapper>

              {/* Row 4: DOB + Year + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputWrapper label="Date of Birth" icon={Calendar}>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="input-field !pl-10 py-3.5"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </InputWrapper>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="input-field py-3.5 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input-field py-3.5 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Password + Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWrapper label="Password" icon={Lock}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10 py-3.5"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </InputWrapper>

                <InputWrapper label="Confirm Password" icon={Lock}>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10 py-3.5"
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </InputWrapper>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 text-base mt-2 shadow-indigo-500/25 active:scale-95 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create Student Account <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="mt-7 text-center text-xs font-bold text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:opacity-70 transition-opacity font-black underline underline-offset-2"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={12} />
            v1.0.4 Release
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 LibraryPro
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;

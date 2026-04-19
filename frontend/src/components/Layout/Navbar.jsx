import React, { useContext, useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/books': 'Book Management',
  '/users': 'User Directory',
  '/issues': 'Circulation Desk',
  '/reports': 'Analytics & Reports',
};

const pageSubtitles = {
  '/': "Welcome back — here's your library at a glance.",
  '/books': 'Search, add, and manage your entire book inventory.',
  '/users': 'Manage students, faculty, and their borrowing records.',
  '/issues': 'Issue books and process returns with automatic fine calculation.',
  '/reports': 'View analytics, fine reports, and export data.',
};

const notifications = [
  { text: 'Sapiens is overdue (Carol White)', time: '2 days ago', dot: 'bg-red-500', type: 'overdue' },
  { text: 'Clean Code due today (Alice Johnson)', time: 'Today', dot: 'bg-amber-500', type: 'warning' },
  { text: 'New user registered: David Brown', time: 'Yesterday', dot: 'bg-violet-500', type: 'info' },
];

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const title = pageTitles[location.pathname] || 'Library Pro';
  const subtitle = pageSubtitles[location.pathname] || '';

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-auto min-h-[72px] bg-card/80 backdrop-blur-xl border-b border-border/60 sticky top-0 z-30 px-5 sm:px-8 flex items-center justify-between gap-4 shadow-[0_1px_20px_rgba(0,0,0,0.04)]">
      {/* Left: Menu Toggle + Page Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all hover:scale-105 active:scale-95"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-foreground leading-none tracking-tight truncate">{title}</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block truncate font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-95 hover:rotate-12"
          title="Toggle dark mode"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-95 relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-red-500 to-rose-400 rounded-full border-2 border-card shadow-sm shadow-red-500/50 animate-pulse" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-14 w-80 sm:w-96 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
              style={{ animation: 'dropdownSlide 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-primary" />
                  <span className="font-bold text-sm">Notifications</span>
                </div>
                <span className="badge bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">2 new</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className={`w-2.5 h-2.5 rounded-full ${n.dot} mt-1.5 shrink-0 shadow-sm`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/60">
                <button className="w-full text-center text-xs font-bold text-primary hover:text-primary/70 transition-colors py-1">
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            id="profile-btn"
            className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-muted transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30 shrink-0 group-hover:scale-105 transition-transform">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Administrator</p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 w-52 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
              style={{ animation: 'dropdownSlide 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <div className="p-4 border-b border-border/60">
                <p className="text-sm font-bold">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

import React, { useContext, useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell, ChevronDown, Menu, Sparkles, X } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

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

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifs(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setLoadingNotifs(false);
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifOpen) {
      const fetchNotifications = async () => {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      };
      fetchNotifications();
    }
  }, [notifOpen]);

  const handleNotificationClick = (type) => {
    setNotifOpen(false);
    if (type === 'overdue' || type === 'warning') navigate('/issues');
    if (type === 'info') navigate('/users');
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    notificationService.dismissNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDismissAll = () => {
    notificationService.dismissAll(notifications);
    setNotifications([]);
  };

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
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-red-500 to-rose-400 rounded-full border-2 border-card shadow-sm shadow-red-500/50 animate-pulse" />
            )}
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
                {notifications.length > 0 && (
                  <span className="badge bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">{notifications.length} new</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                {loadingNotifs && notifications.length === 0 ? (
                  <div className="p-8 flex justify-center items-center">
                    <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n.type)}
                      className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${n.dot} mt-1.5 shrink-0 shadow-sm`} />
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">{n.time}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDismiss(e, n.id)} 
                        className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-border/60">
                  <button 
                    onClick={handleDismissAll}
                    className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Dismiss all notifications
                  </button>
                </div>
              )}
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
              <p className="text-sm font-black leading-none">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
                {user?.role === 'Admin' ? 'Administrator' : user?.role || 'Member'}
              </p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 w-52 bg-white dark:bg-slate-900 border border-border/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] z-50 overflow-hidden"
              style={{ animation: 'dropdownSlide 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <div className="p-4 border-b border-border/60">
                <p className="text-sm font-black">{user?.user_metadata?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">{user?.email}</p>
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

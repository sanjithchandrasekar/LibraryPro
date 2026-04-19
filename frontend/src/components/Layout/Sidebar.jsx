import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users as UsersIcon, ArrowLeftRight,
  BarChart3, LogOut, BookMarked, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/', end: true },
  { title: 'Books', icon: BookOpen, path: '/books' },
  { title: 'Users', icon: UsersIcon, path: '/users' },
  { title: 'Issues', icon: ArrowLeftRight, path: '/issues' },
  { title: 'Reports', icon: BarChart3, path: '/reports' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuth();

  return (
    <aside 
      className={`fixed lg:sticky top-0 left-0 h-screen w-72 sidebar-bg flex flex-col z-50 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <BookMarked size={20} className="text-white drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-foreground font-black text-xl leading-none tracking-tight">Library<span className="text-primary text-gradient">Pro</span></h1>
            <p className="text-[11px] mt-1 font-semibold tracking-wide" style={{ color: 'hsl(var(--sidebar-muted))' }}>MANAGEMENT SYSTEM</p>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl hover:bg-muted sidebar-text transition-all hover:scale-105 active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest pl-3 mb-3" style={{ color: 'hsl(var(--sidebar-muted))' }}>
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm mb-1.5 overflow-hidden
                ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm dark:bg-primary/20 dark:text-primary-foreground'
                  : 'sidebar-text hover:bg-muted/50 dark:hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                  )}
                  <Icon size={20} className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-primary dark:text-primary-foreground drop-shadow-md' : 'sidebar-muted group-hover:text-foreground'}`} />
                  <span className="relative z-10 tracking-wide">{item.title}</span>
                  {isActive && (
                    <ChevronRight size={16} className="ml-auto relative z-10 text-primary/70 dark:text-primary-foreground/70" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest pl-4 mb-3" style={{ color: 'hsl(var(--sidebar-muted))' }}>
            System
          </p>
          <div className="px-4 py-3 rounded-2xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></div>
              <span className="text-xs font-bold text-muted-foreground">Mock Mode</span>
            </div>
            <p className="text-[11px] text-muted-foreground/70 font-medium">
              Database not connected
            </p>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-5 pb-8 relative">
        <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
        <div className="bg-card glass border border-white/20 dark:border-white/10 rounded-2xl p-4 mt-6 mb-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Administrator</p>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform duration-200" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

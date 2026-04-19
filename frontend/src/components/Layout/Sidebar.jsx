import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users as UsersIcon, ArrowLeftRight,
  BarChart3, LogOut, BookMarked, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const adminNav = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/', end: true },
  { title: 'Books', icon: BookOpen, path: '/books' },
  { title: 'Users', icon: UsersIcon, path: '/users' },
  { title: 'Issues', icon: ArrowLeftRight, path: '/issues' },
  { title: 'Reports', icon: BarChart3, path: '/reports' },
];

const userNav = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/', end: true },
  { title: 'Library Catalog', icon: BookOpen, path: '/books' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuth();
  const avatarChar = user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <aside 
      className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-slate-950 border-r border-border flex flex-col z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Branding */}
      <div className="px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookMarked size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-foreground font-black text-xl tracking-tight leading-none">Library<span className="text-primary">Pro</span></h1>
            <p className="text-[10px] mt-1 font-bold tracking-widest text-muted-foreground uppercase">Management System</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-8 space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-4 mb-4">Main Menu</p>
        {(user?.role === 'Admin' ? adminNav : userNav).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3.5 rounded-[1.5rem] transition-all duration-200 font-bold text-sm
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon size={20} />
              <span className="tracking-wide">{item.title}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          );
        })}
      </nav>

      {/* User Card & Sign Out */}
      <div className="px-4 pb-8 space-y-3">
        <div className="bg-muted/40 rounded-[2rem] p-4 flex items-center gap-3.5 border border-border/50">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-md">
            {avatarChar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground truncate">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.role === 'Admin' ? 'Administrator' : user?.role || 'User'}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-[1.5rem] text-sm font-bold text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

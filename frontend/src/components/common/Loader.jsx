import React from 'react';
import { BookMarked } from 'lucide-react';

const sizes = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-2', lg: 'w-14 h-14 border-3' };

const Spinner = ({ size = 'md' }) => (
  <div className="relative flex items-center justify-center">
    <div className={`${sizes[size]} border-transparent border-t-primary border-r-primary rounded-full animate-spin duration-700`} />
    <div className={`absolute inset-0 border-primary/20 ${sizes[size]} rounded-full`} />
  </div>
);

const Loader = ({ fullPage = false, size = 'md' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-500">
          <div className="relative group">
            {/* Outer rings */}
            <div className="absolute -inset-4 border border-primary/30 rounded-[3rem] animate-[spin_6s_linear_infinite]" />
            <div className="absolute -inset-8 border border-primary/10 rounded-[3.5rem] animate-[spin_10s_linear_infinite_reverse]" />
            
            {/* Main icon container */}
            <div className="w-24 h-24 bg-card/50 border border-primary/30 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <BookMarked size={40} className="text-primary group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-xl" />
            </div>
            
            {/* Spinning indicator */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40 animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <h2 className="text-3xl font-black tracking-widest text-foreground uppercase drop-shadow-sm">
              Library<span className="text-primary">Pro</span>
            </h2>
            <div className="flex items-center gap-3 bg-muted/40 px-6 py-3 rounded-full border border-border/50 backdrop-blur-md shadow-inner">
              <Spinner size="sm" />
              <span className="text-xs text-muted-foreground font-black tracking-[0.2em] uppercase">Initializing Workspace</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12 w-full h-full">
      <Spinner size={size} />
    </div>
  );
};

export const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="skeleton h-4" style={{ width: `${[75, 55, 45, 65, 35][i]}%` }}></div>
      </td>
    ))}
  </tr>
);

export default Loader;

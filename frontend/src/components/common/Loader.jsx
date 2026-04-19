import React from 'react';
import { BookMarked } from 'lucide-react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-2', lg: 'w-14 h-14 border-3' };

  const Spinner = () => (
    <div className="relative flex items-center justify-center">
      <div className={`${sizes[size]} border-primary/20 border-t-primary rounded-full spin`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <BookMarked size={28} className="text-white" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner />
            <p className="text-sm text-muted-foreground font-semibold tracking-wide mt-1">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      <Spinner />
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

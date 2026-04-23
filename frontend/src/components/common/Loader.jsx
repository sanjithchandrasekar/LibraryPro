import React from 'react';

// ── Inline / small loader: animated 3-dot pulse ───────────────────────────────
export const Dots = () => (
  <span className="inline-flex items-center gap-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{ animationDelay: `${i * 0.15}s` }}
        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
      />
    ))}
  </span>
);

// ── Button spinner: small ring used inside buttons ────────────────────────────
export const BtnSpinner = ({ light = true }) => (
  <span
    className={`inline-block w-4 h-4 rounded-full border-2 animate-spin
      ${light ? 'border-white/30 border-t-white' : 'border-primary/30 border-t-primary'}`}
  />
);

// ── Skeleton row (table) ──────────────────────────────────────────────────────
export const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="skeleton h-4" style={{ width: `${[75, 55, 45, 65, 35][i]}%` }} />
      </td>
    ))}
  </tr>
);

// ── Full-page / section loader ────────────────────────────────────────────────
const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/8 blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/6 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10">

          {/* Book stack animation */}
          <div className="relative w-20 flex flex-col-reverse items-center gap-1.5">
            {[
              { color: 'bg-violet-500', delay: '0s',    width: 'w-20' },
              { color: 'bg-indigo-500', delay: '0.15s', width: 'w-16' },
              { color: 'bg-purple-400', delay: '0.3s',  width: 'w-12' },
              { color: 'bg-violet-300', delay: '0.45s', width: 'w-8'  },
            ].map((book, i) => (
              <div
                key={i}
                style={{
                  animationDelay: book.delay,
                  animationDuration: '1.2s',
                }}
                className={`${book.width} h-3 ${book.color} rounded-sm shadow-lg animate-[bookPulse_1.2s_ease-in-out_infinite]`}
              />
            ))}

            {/* Shadow under the stack */}
            <div className="w-20 h-1.5 rounded-full bg-black/10 dark:bg-black/30 blur-sm mt-1" />
          </div>

          {/* Brand name */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              Library<span className="text-violet-500">Pro</span>
            </h1>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-[progressBar_1.8s_ease-in-out_infinite]" />
            </div>

            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground opacity-60">
              Loading your workspace…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Section-level loader (e.g. inside a card) ─────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 w-full">
      {/* Mini book stack */}
      <div className="flex flex-col-reverse items-center gap-1">
        {[
          { color: 'bg-violet-500', delay: '0s',    width: 'w-10' },
          { color: 'bg-indigo-500', delay: '0.15s', width: 'w-8'  },
          { color: 'bg-purple-400', delay: '0.3s',  width: 'w-6'  },
        ].map((book, i) => (
          <div
            key={i}
            style={{ animationDelay: book.delay, animationDuration: '1.2s' }}
            className={`${book.width} h-2 ${book.color} rounded-sm animate-[bookPulse_1.2s_ease-in-out_infinite]`}
          />
        ))}
      </div>
      <Dots />
    </div>
  );
};

export default Loader;

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...', variant = 'card', count = 3 }) {
  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3 animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-400">{message}</p>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3 p-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-900/60 rounded-xl border border-slate-800/80" />
        ))}
      </div>
    );
  }

  // Grid/Cards skeleton variant
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col">
          <div className="w-full aspect-[4/3] bg-slate-900" />
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded-md w-1/2" />
            </div>
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-3 bg-slate-800/40 rounded w-1/3" />
              <div className="h-3 bg-slate-800/40 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

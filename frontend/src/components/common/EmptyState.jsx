import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Try adjusting your search or filters.',
  actionText,
  actionLink,
  onActionClick,
}) {
  return (
    <div className="glass-card p-10 sm:p-14 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto my-6 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 flex items-center justify-center text-teal-400 mx-auto mb-4 shadow-inner">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 hover:from-teal-300 hover:to-cyan-300 transition-all shadow-glow transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>{actionText}</span>
        </Link>
      )}

      {actionText && onActionClick && !actionLink && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 hover:from-teal-300 hover:to-cyan-300 transition-all shadow-glow cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

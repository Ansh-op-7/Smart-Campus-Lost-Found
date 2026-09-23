import React from 'react';
import { X, CheckCircle, XCircle, PackageCheck, AlertCircle } from 'lucide-react';

export default function ClaimActionModal({ isOpen, onClose, onConfirm, actionType, claim, isProcessing }) {
  if (!isOpen || !claim) return null;

  const isApprove = actionType === 'APPROVE';
  const isReject = actionType === 'REJECT';
  const isComplete = actionType === 'COMPLETE';

  let title = 'Confirm Action';
  let description = 'Please confirm the claim update.';
  let confirmText = 'Confirm';
  let confirmColor = 'bg-teal-500 hover:bg-teal-400 text-slate-950';
  let Icon = CheckCircle;
  let iconBg = 'bg-teal-500/10 text-teal-400 border-teal-500/20';

  if (isApprove) {
    title = 'Approve Claim';
    description =
      'Approve this claim? The item will be marked as CLAIMED and other pending claims for this item will be automatically rejected.';
    confirmText = 'Approve Claim';
    confirmColor = 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950';
    Icon = CheckCircle;
    iconBg = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  } else if (isReject) {
    title = 'Reject Claim';
    description =
      'Are you sure you want to reject this claim? The claimant will see that their ownership proof was declined.';
    confirmText = 'Reject Claim';
    confirmColor = 'bg-rose-600 hover:bg-rose-500 text-white';
    Icon = XCircle;
    iconBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (isComplete) {
    title = 'Confirm Item Handover';
    description =
      'Confirm that the item has been physically returned to its owner? The item will transition to RETURNED and the recovery will be completed.';
    confirmText = 'Mark as Returned';
    confirmColor = 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950';
    Icon = PackageCheck;
    iconBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/95 relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl border ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">Claim #{claim.id} • {claim.item?.title}</p>
          </div>
        </div>

        {/* Message / Description */}
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer ${confirmColor}`}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

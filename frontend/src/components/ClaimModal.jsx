import React, { useState } from 'react';
import { X, Send, AlertCircle, ShieldCheck, Tag, MapPin } from 'lucide-react';
import { claimService } from '../services/claimService';

export default function ClaimModal({ isOpen, onClose, item, onClaimSubmitted }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = message.trim();
    if (trimmed.length < 5) {
      setErrorMessage('Please provide at least 5 characters explaining proof of ownership.');
      return;
    }
    if (trimmed.length > 1000) {
      setErrorMessage('Claim message cannot exceed 1000 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const claim = await claimService.createClaim({
        itemId: item.id,
        message: trimmed,
      });
      setMessage('');
      if (onClaimSubmitted) onClaimSubmitted(claim);
      onClose();
    } catch (err) {
      console.error('Failed to submit claim', err);
      const backendError =
        err.response?.data?.message ||
        'Failed to submit claim. You may already have an active claim or the item is no longer available.';
      setErrorMessage(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-teal-500/30 shadow-2xl bg-slate-950/95 relative animate-scale-up">
        
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Claim This Item</h2>
            <p className="text-xs text-slate-400">Submit ownership proof to the finder.</p>
          </div>
        </div>

        {/* Item Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 mb-5 text-xs">
          <div className="font-bold text-slate-200 text-sm mb-1">{item.title}</div>
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span className="inline-flex items-center gap-1 text-teal-400">
              <Tag className="w-3 h-3" />
              {item.category?.name || 'General'}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {item.location || 'Campus'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Claim Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
              <label htmlFor="claim-message">
                Explain why this item belongs to you <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[11px] font-normal ${message.length > 900 ? 'text-amber-400' : 'text-slate-500'}`}>
                {message.length} / 1000
              </span>
            </div>
            <textarea
              id="claim-message"
              rows={4}
              required
              maxLength={1000}
              placeholder="e.g. This is my blue wallet. Inside there is a student ID with name Alex, 3 cards, and a small metal zipper pull..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-all outline-none resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Include specific details only the true owner would know (unique marks, lock codes, contents).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length < 5}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Submit Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

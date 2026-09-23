import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  PackageCheck,
  Clock,
  Calendar,
  MapPin,
  Tag,
  User,
  AlertCircle,
  CheckCircle2,
  ImageOff,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { claimService } from '../services/claimService';
import { resolveImageUrl, formatDate } from '../components/ItemCard';
import ClaimActionModal from '../components/ClaimActionModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Claims() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'my'
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    actionType: null, // 'APPROVE' | 'REJECT' | 'COMPLETE'
    claim: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [receivedData, myData] = await Promise.all([
        claimService.getReceivedClaims(),
        claimService.getMyClaims(),
      ]);
      setReceivedClaims(receivedData || []);
      setMyClaims(myData || []);

      // Auto switch to 'my' if user has no received claims but has submitted claims
      if ((!receivedData || receivedData.length === 0) && myData && myData.length > 0) {
        setActiveTab('my');
      }
    } catch (err) {
      console.error('Failed to load claims', err);
      setError('Unable to load claims data from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const openActionModal = (claim, actionType) => {
    setActionModal({
      isOpen: true,
      actionType,
      claim,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      actionType: null,
      claim: null,
    });
  };

  const handleConfirmAction = async () => {
    const { actionType, claim } = actionModal;
    if (!claim || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === 'APPROVE' || actionType === 'REJECT') {
        await claimService.updateClaimStatus(claim.id, actionType);
        toast.success(
          actionType === 'APPROVED' || actionType === 'APPROVE'
            ? 'Claim approved! Item is now marked as CLAIMED.'
            : 'Claim has been rejected.'
        );
      } else if (actionType === 'COMPLETE') {
        await claimService.completeClaim(claim.id);
        toast.success('Item marked as RETURNED! Recovery completed.');
      }
      closeActionModal();
      await fetchClaims();
    } catch (err) {
      console.error('Action failed', err);
      toast.error(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm">
            <CheckCircle className="w-3 h-3 text-teal-400" />
            <span>Claim Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Declined</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <PackageCheck className="w-3 h-3 text-emerald-400" />
            <span>Item Returned</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold text-slate-400">
            {status}
          </span>
        );
    }
  };

  const currentList = activeTab === 'received' ? receivedClaims : myClaims;

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl mb-8">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Recovery Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Claim &amp; Recovery Management
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Review incoming ownership proofs for items you found, or track claims you submitted.
            </p>
          </div>

          <button
            onClick={fetchClaims}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('received')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'received'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Claims Received</span>
          {receivedClaims.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300">
              {receivedClaims.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'my'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Submitted Claims</span>
          {myClaims.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              {myClaims.length}
            </span>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Claims List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-6 rounded-2xl border border-slate-800 h-36 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((claim) => {
            const item = claim.item;
            const fullImg = resolveImageUrl(item?.imageUrl);
            const isReporter = activeTab === 'received';

            return (
              <div
                key={claim.id}
                className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800/90 hover:border-slate-700/90 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
              >
                {/* Left: Thumbnail & Item details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  
                  {/* Item Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 flex items-center justify-center">
                    {fullImg ? (
                      <img src={fullImg} alt={item?.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(claim.status)}
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Claim #{claim.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(claim.createdAt)}
                      </span>
                    </div>

                    {/* Item title link */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                        {item?.title}
                      </h3>
                      {item && (
                        <Link
                          to={`/items/${item.id}`}
                          className="text-slate-500 hover:text-teal-400 transition-colors"
                          title="View item page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {/* Proof message box */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-teal-400" />
                        <span>
                          {isReporter
                            ? `Claimant: ${claim.claimant?.name} (${claim.claimant?.email})`
                            : 'Your Ownership Proof:'}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-slate-200">{claim.message}</p>
                    </div>

                    {/* Item location tag */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {item?.location || 'Campus'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-end lg:self-center w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Reporter Actions on PENDING claims */}
                  {isReporter && claim.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openActionModal(claim, 'APPROVE')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => openActionModal(claim, 'REJECT')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Actions on APPROVED claims: Mark as Returned */}
                  {claim.status === 'APPROVED' && (
                    <button
                      onClick={() => openActionModal(claim, 'COMPLETE')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-glow transition-all cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Mark as Returned</span>
                    </button>
                  )}

                  {/* View public item */}
                  {item && (
                    <Link
                      to={`/items/${item.id}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                    >
                      <span>Item Details</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            {activeTab === 'received' ? (
              <Inbox className="w-8 h-8 stroke-[1.5]" />
            ) : (
              <Send className="w-8 h-8 stroke-[1.5]" />
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {activeTab === 'received'
              ? 'No Claims Received'
              : 'No Claims Submitted'}
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {activeTab === 'received'
              ? 'When students submit ownership proof for items you reported found, they will appear here for your review.'
              : 'Browse found items on campus and submit ownership proof if you spot your lost possession.'}
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all"
          >
            <span>Browse Campus Feed</span>
          </Link>
        </div>
      )}

      {/* Claim Action Confirmation Modal */}
      <ClaimActionModal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        onConfirm={handleConfirmAction}
        actionType={actionModal.actionType}
        claim={actionModal.claim}
        isProcessing={isProcessing}
      />
    </div>
  );
}

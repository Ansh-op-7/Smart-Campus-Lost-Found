import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  User,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { claimService } from '../../services/claimService';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { formatDate } from '../../components/ItemCard';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Action Dialog state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT' | 'COMPLETE'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getClaims({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to load admin claims:', err);
      setError('Unable to load claims. Please verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, search]);

  const handleActionClick = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedClaim || !actionType) return;

    try {
      setActionLoading(true);
      setError(null);

      if (actionType === 'APPROVE') {
        await claimService.updateClaimStatus(selectedClaim.id, 'APPROVED');
        setSuccessMessage(`Approved claim #${selectedClaim.id} for "${selectedClaim.item?.title}".`);
      } else if (actionType === 'REJECT') {
        await claimService.updateClaimStatus(selectedClaim.id, 'REJECTED');
        setSuccessMessage(`Rejected claim #${selectedClaim.id}.`);
      } else if (actionType === 'COMPLETE') {
        await claimService.completeClaim(selectedClaim.id);
        setSuccessMessage(`Recovery completed and marked returned for claim #${selectedClaim.id}.`);
      }

      setTimeout(() => setSuccessMessage(null), 4000);
      setDialogOpen(false);
      setSelectedClaim(null);
      fetchClaims();
    } catch (err) {
      console.error('Failed to execute claim action:', err);
      setError(err.response?.data?.message || 'Failed to update claim.');
      setDialogOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <PackageCheck className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Campus Claim Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            All Claims &amp; Recoveries ({claims.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify ownership evidence, arbitrate recovery claims, and mark successful handovers.
          </p>
        </div>

        <button
          onClick={fetchClaims}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((st) => (
            <button
              key={st || 'ALL'}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-glow'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {st || 'All Claims'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claimant, item, text..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Item</th>
                <th className="py-3.5 px-4">Claimant</th>
                <th className="py-3.5 px-4">Proof Message</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span>Loading claims...</span>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No claims found</p>
                    <p className="text-[11px]">No claims match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Item */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="max-w-xs">
                        <Link
                          to={`/items/${claim.item?.id}`}
                          className="font-bold text-white hover:text-teal-300 transition-colors truncate block"
                        >
                          {claim.item?.title || 'Unknown Item'}
                        </Link>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Reported by {claim.item?.reporter?.name || 'Student'} ({claim.item?.location || 'Campus'})
                        </div>
                      </div>
                    </td>

                    {/* Claimant */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">
                        {claim.claimant?.name || 'Student'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {claim.claimant?.email}
                      </div>
                    </td>

                    {/* Proof message */}
                    <td className="py-4 px-4">
                      <div className="max-w-sm text-slate-300 text-xs italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 line-clamp-3">
                        "{claim.message}"
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(claim.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {claim.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleActionClick(claim, 'APPROVE')}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleActionClick(claim, 'REJECT')}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {claim.status === 'APPROVED' && (
                          <button
                            onClick={() => handleActionClick(claim, 'COMPLETE')}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            Mark Returned
                          </button>
                        )}

                        <Link
                          to={`/items/${claim.item?.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Item"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        title={
          actionType === 'APPROVE'
            ? 'Approve Claim on Behalf of Campus'
            : actionType === 'REJECT'
            ? 'Reject Claim'
            : 'Complete Recovery & Handover'
        }
        message={
          actionType === 'APPROVE'
            ? `Approve ${selectedClaim?.claimant?.name}'s claim for "${selectedClaim?.item?.title}"? The item will be marked CLAIMED and rival pending claims will be rejected.`
            : actionType === 'REJECT'
            ? `Decline ${selectedClaim?.claimant?.name}'s claim for "${selectedClaim?.item?.title}"?`
            : `Mark "${selectedClaim?.item?.title}" as successfully RETURNED to ${selectedClaim?.claimant?.name}?`
        }
        confirmText={
          actionType === 'APPROVE' ? 'Approve Claim' : actionType === 'REJECT' ? 'Reject Claim' : 'Mark Returned'
        }
        confirmVariant={actionType === 'REJECT' ? 'danger' : 'primary'}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedClaim(null);
        }}
      />
    </div>
  );
}

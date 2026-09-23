import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  User,
  Clock,
  ShieldCheck,
  ImageOff,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  Inbox,
  Sparkles,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { matchService } from '../services/matchService';
import { resolveImageUrl, formatDate } from '../components/ItemCard';
import ClaimModal from '../components/ClaimModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Smart Matching State
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    itemService
      .getItemById(id)
      .then((data) => {
        setItem(data);
      })
      .catch((err) => {
        console.error('Failed to load item details', err);
        setError(
          err.response?.status === 404
            ? 'The requested item could not be found or may have been deleted.'
            : 'Unable to load item details from backend.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setMatchesLoading(true);
    setMatchesError('');
    matchService
      .getMatches(id)
      .then((data) => {
        setMatches(data || []);
      })
      .catch((err) => {
        console.error('Failed to load matches for item', err);
        setMatchesError('Unable to load smart matches at this time.');
      })
      .finally(() => {
        setMatchesLoading(false);
      });
  }, [id]);

  const handleClaimSuccess = (claim) => {
    showToast('Claim submitted successfully! The finder will review your ownership proof.', 'success');
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Item link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800/60 rounded w-1/2" />
            <div className="h-24 bg-slate-800/40 rounded-xl" />
            <div className="h-40 bg-slate-800/30 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Item Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error || 'Unknown error occurred.'}</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  const fullImageUrl = resolveImageUrl(item.imageUrl);
  const isLost = item.type === 'LOST';
  const isResolved = item.status === 'RESOLVED' || item.status === 'RETURNED';
  const isClaimed = item.status === 'CLAIMED';
  const isReporter = user && item.reportedBy && user.id === item.reportedBy.id;
  const canClaim = !isLost && item.status === 'ACTIVE' && !isReporter;

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link & Quick Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse Feed</span>
        </Link>

        <button
          onClick={handleShareClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-teal-400" />
          <span>Share Item</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Big Image Display */}
        <div className="lg:col-span-6">
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl bg-slate-950">
            <div className="relative w-full aspect-square sm:h-[420px] bg-slate-900 flex items-center justify-center">
              {fullImageUrl && !imageError ? (
                <img
                  src={fullImageUrl}
                  alt={item.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 gap-2 p-8 text-center">
                  <ImageOff className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-xs font-medium text-slate-500">No Photo Uploaded</span>
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                    isLost
                      ? 'bg-rose-500/90 text-white border border-rose-400/40'
                      : 'bg-emerald-500/90 text-white border border-emerald-400/40'
                  }`}
                >
                  {item.type} ITEM
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                    isResolved
                      ? 'bg-slate-900/90 text-slate-300 border border-slate-700'
                      : isClaimed
                      ? 'bg-amber-500/90 text-slate-950 border border-amber-400 font-extrabold'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {item.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Title & Category */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category?.name || 'General Category'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Item Description
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {item.description || 'No description provided.'}
              </p>
            </div>

            {/* Location & Time Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Location</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{item.location || 'Campus'}</div>
                </div>
              </div>

              <div className="glass-card p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">
                    {isLost ? 'Date Lost' : 'Date Found'}
                  </div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {formatDate(item.itemDate || item.dateReported)}
                  </div>
                </div>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 font-bold">
                  {item.reportedBy?.name ? item.reportedBy.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">
                    Reported by {item.reportedBy?.name || 'Campus Student'}
                    {isReporter && (
                      <span className="ml-2 text-[10px] font-bold text-teal-300 bg-teal-500/20 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Reported on {formatDate(item.dateReported || item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified User</span>
              </div>
            </div>
          </div>

          {/* Action Section: Claim Item */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            {canClaim && (
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-glow transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                I think this is mine
              </button>
            )}

            {isReporter && !isLost && (
              <Link
                to="/claims"
                className="w-full py-3 px-6 rounded-2xl font-semibold text-xs inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 transition-colors"
              >
                <Inbox className="w-4 h-4" />
                <span>View Received Claims for this Item</span>
              </Link>
            )}

            {isClaimed && !canClaim && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-medium">
                This item is currently CLAIMED and awaiting physical handover.
              </div>
            )}

            {isResolved && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-center font-medium">
                This item has been successfully returned and closed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Lost & Found Matching Section */}
      <div className="mt-12 pt-8 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {isLost ? 'Possible Found Matches' : 'Possible Lost Matches'}
              </h2>
              <p className="text-xs text-slate-400">
                {isLost
                  ? 'FindIt smart matching engine identified items reported found that might match yours.'
                  : 'FindIt smart matching engine identified items reported lost that might match this.'}
              </p>
            </div>
          </div>
          {matches.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
            </span>
          )}
        </div>

        {/* Matches Content */}
        {matchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-slate-800/40 rounded w-full" />
              </div>
            ))}
          </div>
        ) : matchesError ? (
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 text-center">
            {matchesError}
          </div>
        ) : matches.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-1">No Strong Matches Found Yet</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Our smart algorithm checks category, title keywords, location, description, and dates. As new items are reported, potential matches will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => {
              const matchImg = resolveImageUrl(match.imageUrl);
              const score = match.matchScore || 0;
              const badgeColor =
                score >= 75
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : score >= 50
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

              return (
                <div
                  key={match.itemId}
                  className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row: thumbnail + title + score */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {matchImg ? (
                          <img src={matchImg} alt={match.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff className="w-6 h-6 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{score}% Match</span>
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {match.type}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                          {match.title}
                        </h3>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          {match.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <span className="truncate">{match.location}</span>
                            </span>
                          )}
                          {match.itemDate && (
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDate(match.itemDate)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match reasons tags */}
                    {match.matchReasons && match.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-slate-800/60">
                        {match.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View matched item CTA */}
                  <Link
                    to={`/items/${match.itemId}`}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Item Details</span>
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        item={item}
        onClaimSubmitted={handleClaimSuccess}
      />
    </div>
  );
}

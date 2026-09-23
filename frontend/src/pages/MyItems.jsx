import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  ImageOff,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { resolveImageUrl, formatDate } from '../components/ItemCard';
import EditItemModal from '../components/EditItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useToast } from '../context/ToastContext';

export default function MyItems() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, LOST, FOUND, ACTIVE, CLAIMED, RETURNED

  // Modal states
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await itemService.getMyItems();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load my items', err);
      setError('Unable to load your reported items from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const handleEditSave = (updatedItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === updatedItem.id ? updatedItem : it))
    );
    toast.success('Item updated successfully.');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await itemService.deleteItem(deletingItem.id);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      toast.success('Item deleted successfully.');
      setDeletingItem(null);
    } catch (err) {
      console.error('Failed to delete item', err);
      const msg = err.response?.data?.message || 'Failed to delete item. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered items based on activeTab
  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return items;
    if (activeTab === 'LOST') return items.filter((it) => it.type === 'LOST');
    if (activeTab === 'FOUND') return items.filter((it) => it.type === 'FOUND');
    if (activeTab === 'ACTIVE') return items.filter((it) => it.status === 'ACTIVE');
    if (activeTab === 'CLAIMED') return items.filter((it) => it.status === 'CLAIMED');
    if (activeTab === 'RETURNED') {
      return items.filter((it) => it.status === 'RETURNED' || it.status === 'RESOLVED');
    }
    return items;
  }, [items, activeTab]);

  const tabs = [
    { id: 'ALL', label: 'All Items', count: items.length },
    { id: 'LOST', label: 'Lost', count: items.filter((i) => i.type === 'LOST').length },
    { id: 'FOUND', label: 'Found', count: items.filter((i) => i.type === 'FOUND').length },
    { id: 'ACTIVE', label: 'Active', count: items.filter((i) => i.status === 'ACTIVE').length },
    { id: 'CLAIMED', label: 'Claimed', count: items.filter((i) => i.status === 'CLAIMED').length },
    {
      id: 'RETURNED',
      label: 'Returned',
      count: items.filter((i) => i.status === 'RETURNED' || i.status === 'RESOLVED').length,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl mb-8">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Package className="w-3.5 h-3.5" />
              <span>Personal Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              My Reported Items
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Manage, edit, or resolve items you have posted on campus.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Items List / Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-card p-5 rounded-2xl border border-slate-800 h-28 animate-pulse bg-slate-900/40"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isLost = item.type === 'LOST';
            const isResolved = item.status === 'RESOLVED' || item.status === 'RETURNED';
            const fullImg = resolveImageUrl(item.imageUrl);

            return (
              <div
                key={item.id}
                className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                {/* Left: Image & Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 flex items-center justify-center">
                    {fullImg ? (
                      <img
                        src={fullImg}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          isLost
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                          isResolved
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                        }`}
                      >
                        {item.status || 'ACTIVE'}
                      </span>
                      <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                      <span className="text-xs text-teal-400 font-medium hidden sm:inline">
                        {item.category?.name || 'General'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors truncate">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{item.location || 'Campus'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(item.itemDate || item.dateReported)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {!isLost && (
                    <Link
                      to="/claims"
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-colors"
                      title="View received claims"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Claims</span>
                    </Link>
                  )}

                  <Link
                    to={`/items/${item.id}`}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                    title="View public details"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    <span>View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                    title="Edit item"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Package className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            You haven&apos;t reported any items yet.
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Report lost possessions or items you found on campus to start tracking them here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/report/lost"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Report Lost Item</span>
            </Link>
            <Link
              to="/report/found"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Report Found Item</span>
            </Link>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditItemModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSaveSuccess={handleEditSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}

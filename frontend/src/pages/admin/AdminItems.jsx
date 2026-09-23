import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { itemService } from '../../services/itemService';
import { categoryService } from '../../services/categoryService';
import { resolveImageUrl, formatDate } from '../../components/ItemCard';
import EditItemModal from '../../components/EditItemModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    categoryService.getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getItems({
        search: search,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        categoryId: selectedCategory || undefined,
      });
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load admin items:', err);
      setError('Unable to load items. Please verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, selectedType, selectedStatus, selectedCategory]);

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setActionLoading(true);
      setError(null);
      await itemService.deleteItem(deletingItem.id);
      setSuccessMessage(`Successfully deleted item "${deletingItem.title}".`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setDeleteConfirmOpen(false);
      setDeletingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(err.response?.data?.message || 'Failed to delete item.');
      setDeleteConfirmOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    setSuccessMessage('Item updated successfully.');
    setTimeout(() => setSuccessMessage(null), 4000);
    fetchItems();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
            <Package className="w-4 h-4" />
            <span>Campus Items Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            All Reported Items ({items.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, edit, and moderate all campus lost and found submissions.
          </p>
        </div>

        <button
          onClick={fetchItems}
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

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Types (Lost &amp; Found)</option>
          <option value="LOST">Lost Items</option>
          <option value="FOUND">Found Items</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="CLAIMED">CLAIMED</option>
          <option value="RETURNED">RETURNED</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading items...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No items found</p>
                    <p className="text-[11px]">No items match the current filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const resolvedImg = resolveImageUrl(item.imageUrl);
                  const isLost = item.type === 'LOST';

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Image & Title */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {resolvedImg ? (
                              <img
                                src={resolvedImg}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                  isLost
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                }`}
                              >
                                {item.type}
                              </span>
                              <Link
                                to={`/items/${item.id}`}
                                className="font-bold text-white hover:text-teal-300 transition-colors truncate"
                              >
                                {item.title}
                              </Link>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-300">
                        {item.category?.name || 'Uncategorized'}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{item.location || '—'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            item.status === 'ACTIVE'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : item.status === 'CLAIMED'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="py-4 px-4">
                        <div className="text-slate-200 font-medium">
                          {item.reporter?.name || 'Student'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                          {item.reporter?.email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(item.itemDate || item.dateReported)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/items/${item.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded-lg text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          isOpen={true}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaveSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Campus Item"
        message={`Are you sure you want to delete "${deletingItem?.title}"? This action permanently removes the item and any associated claims and photo files.`}
        confirmText="Delete Item"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingItem(null);
        }}
      />
    </div>
  );
}

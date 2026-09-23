import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Layers,
  MapPin,
  Tag,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';

export default function Browse() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(''); // '' (ALL), 'LOST', 'FOUND'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // '' (ALL), 'ACTIVE', 'CLAIMED', 'RETURNED'
  const [locationQuery, setLocationQuery] = useState('');

  // Fetch categories once
  useEffect(() => {
    categoryService
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch items from real backend
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await itemService.getItems({
        search: searchQuery.trim() || undefined,
        type: selectedType || undefined,
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        location: locationQuery.trim() || undefined,
      });
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching items', err);
      setError('Unable to load items from the server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedCategory, selectedStatus, locationQuery]);

  // Debounced/instant fetch trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedStatus('');
    setLocationQuery('');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedType) ||
    Boolean(selectedCategory) ||
    Boolean(selectedStatus) ||
    Boolean(locationQuery);
    Boolean(selectedCategory) ||
    Boolean(locationQuery);

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl mb-8">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Campus Lost &amp; Found Feed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Campus Lost &amp; Found
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Find something that belongs to you, or browse items reported across campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all duration-150"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all duration-150"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg mb-8 space-y-4">
        
        {/* Top Row: Search input & Type toggles */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* Keyword Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by keyword, item name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
          </div>

          {/* Type Toggle (ALL / LOST / FOUND) */}
          <div className="inline-flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setSelectedType('')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === ''
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('LOST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === 'LOST'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lost Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('FOUND')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === 'FOUND'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Bottom Row: Category dropdown, Location filter, Clear button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-800/80">
          
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 transition-all outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="relative flex-1 sm:max-w-[160px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 transition-all outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CLAIMED">Claimed</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          {/* Location Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 transition-all outline-none"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          <div className="text-xs text-slate-500 ml-auto hidden md:block">
            Showing <span className="font-semibold text-slate-300">{items.length}</span> items
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <div className="font-bold">Error loading items</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Items Grid / Loading / Empty State */}
      {loading ? (
        /* Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="glass-card rounded-2xl border border-slate-800 p-4 h-80 flex flex-col justify-between animate-pulse"
            >
              <div className="w-full h-40 bg-slate-800 rounded-xl mb-4" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-full" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        /* Real Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Search className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No matching items found</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Try changing your search query or removing active filters to see more results.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          ) : (
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report First Item</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

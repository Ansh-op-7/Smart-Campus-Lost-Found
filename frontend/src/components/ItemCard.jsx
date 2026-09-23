import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowRight, ImageOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's a relative path from backend (e.g., /uploads/items/photo.jpg)
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Date not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function ItemCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const fullImageUrl = resolveImageUrl(item.imageUrl);

  const isLost = item.type === 'LOST';
  const isResolved = item.status === 'RESOLVED' || item.status === 'RETURNED';

  return (
    <div className="glass-card rounded-2xl border border-slate-800/90 hover:border-teal-500/40 transition-all duration-200 overflow-hidden flex flex-col h-full group hover:shadow-xl hover:shadow-teal-500/5">
      
      {/* Card Image Container */}
      <div className="relative w-full h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
        {fullImageUrl && !imageError ? (
          <img
            src={fullImageUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-1.5 p-4 text-center">
            <ImageOff className="w-8 h-8 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-slate-500">No Photo Available</span>
          </div>
        )}

        {/* Type Badge (LOST / FOUND) */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md ${
              isLost
                ? 'bg-rose-500/90 text-white border border-rose-400/40'
                : 'bg-emerald-500/90 text-white border border-emerald-400/40'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase backdrop-blur-md border ${
              isResolved
                ? 'bg-slate-900/90 text-slate-300 border-slate-700'
                : item.status === 'CLAIMED'
                ? 'bg-amber-500/90 text-slate-950 border-amber-400 font-bold'
                : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
            }`}
          >
            {item.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-medium mb-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>{item.category?.name || 'General'}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1 mb-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata & Action */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 truncate mr-2" title={item.location}>
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{item.location || 'Campus'}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(item.itemDate || item.dateReported)}</span>
            </div>
          </div>

          <Link
            to={`/items/${item.id}`}
            className="w-full mt-3 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-teal-500 hover:text-slate-950 border border-slate-800 hover:border-teal-400 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

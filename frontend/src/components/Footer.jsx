import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand info */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-200 tracking-tight text-sm">
              Find<span className="text-teal-400">It</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>Smart Campus Lost &amp; Found</span>
          </div>

          {/* Highlights */}
          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Verified Retrieval
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Campus-wide
            </span>
          </div>

          {/* Copyright & Stack */}
          <div className="text-slate-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} FindIt Portal. Powered by Spring Boot &amp; React.
          </div>
        </div>
      </div>
    </footer>
  );
}

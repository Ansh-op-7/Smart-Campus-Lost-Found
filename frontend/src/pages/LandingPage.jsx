import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Bell,
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck2,
  PackageCheck,
  Compass,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkBackendHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    message: 'Checking API status...',
    details: null,
  });

  const testBackendConnection = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await checkBackendHealth();
      setBackendStatus({
        loading: false,
        connected: true,
        message: data.message || 'Connected to backend',
        details: data,
      });
    } catch (err) {
      setBackendStatus({
        loading: false,
        connected: false,
        message: 'Backend offline (run Spring Boot on port 8080)',
        details: null,
      });
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col justify-between">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 flex-1 flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-teal-500/30 text-teal-300 text-xs font-semibold mb-8 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Next-Gen Campus Lost &amp; Found
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 text-center font-['Plus_Jakarta_Sans'] leading-tight">
          Find<span className="text-teal-400">It</span>
        </h1>
        <h2 className="text-xl sm:text-3xl font-bold text-slate-200 tracking-tight mb-4 text-center">
          Smart Campus Lost &amp; Found
        </h2>

        {/* Concise Value Proposition */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 text-center leading-relaxed mb-8">
          Lost something? Found something?<br />
          <span className="text-white font-semibold">Find the right person faster. Return it smarter.</span>
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-16">
          <Link
            to={isAuthenticated ? '/browse' : '/login'}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 shadow-glow transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Layers className="w-4 h-4" />
            <span>Browse Items</span>
          </Link>

          <Link
            to={isAuthenticated ? '/report/lost' : '/login'}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm glass-card hover:bg-slate-800/80 text-white border border-slate-700/80 hover:border-teal-500/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-4 h-4 text-rose-400 stroke-[2.5]" />
            <span>Report Lost Item</span>
          </Link>
        </div>

        {/* Section: How FindIt Works */}
        <div className="w-full max-w-5xl mb-16">
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              Simple 4-Step Process
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 font-['Plus_Jakarta_Sans']">
              How FindIt Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-teal-500/30 transition-all">
              <div>
                <div className="text-2xl font-extrabold text-teal-400/30 font-['Plus_Jakarta_Sans'] mb-2">01</div>
                <h4 className="text-sm font-bold text-white mb-1">Report</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Post details of lost or found belongings with category, location, and photos.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-teal-500/30 transition-all">
              <div>
                <div className="text-2xl font-extrabold text-teal-400/30 font-['Plus_Jakarta_Sans'] mb-2">02</div>
                <h4 className="text-sm font-bold text-white mb-1">Discover</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explore real-time campus listings filtered by type, categories, and locations.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-teal-500/30 transition-all">
              <div>
                <div className="text-2xl font-extrabold text-teal-400/30 font-['Plus_Jakarta_Sans'] mb-2">03</div>
                <h4 className="text-sm font-bold text-white mb-1">Match</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our smart engine automatically calculates high-confidence matches with clear reasons.
                </p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-teal-500/30 transition-all">
              <div>
                <div className="text-2xl font-extrabold text-teal-400/30 font-['Plus_Jakarta_Sans'] mb-2">04</div>
                <h4 className="text-sm font-bold text-white mb-1">Recover</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit ownership verification, review claims, and coordinate physical handover.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Concise Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl text-left mb-12">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Smart Matching</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated scoring across categories, title keywords, and locations.</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Secure Claims</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified claim review and safe physical return tracking.</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Campus Search</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Filter by specific campus halls, libraries, and laboratories.</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Notifications</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant alerts when someone claims or approves your item.</p>
            </div>
          </div>
        </div>

        {/* Backend API Health Status Indicator */}
        <div className="glass-panel px-4 py-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 max-w-md w-full text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {backendStatus.loading ? (
              <RefreshCw className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />
            ) : backendStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <div className="truncate text-left">
              <span className="font-semibold text-slate-300">Backend API: </span>
              <span className={backendStatus.connected ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                {backendStatus.message}
              </span>
            </div>
          </div>
          <button
            onClick={testBackendConnection}
            title="Retry backend health check"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${backendStatus.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </main>
    </div>
  );
}

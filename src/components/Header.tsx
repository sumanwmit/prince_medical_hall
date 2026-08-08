import React from 'react';
import { 
  Pill, 
  Receipt, 
  PackageSearch, 
  ScanLine, 
  ShieldAlert, 
  Users, 
  BarChart3, 
  Clock, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  expiringCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  expiringCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner with Store Details & Operating Status */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Open Today: 8:00 AM – 10:30 PM
            </span>
            <span className="hidden sm:inline text-emerald-500/60">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 12/A College Street, Kolkata, WB
            </span>
            <span className="hidden md:inline text-emerald-500/60">•</span>
            <span className="hidden md:inline text-slate-300">
              DL No: <strong className="text-white">20B/21B-WB-109482</strong>
            </span>
            <span className="hidden lg:inline text-emerald-500/60">•</span>
            <span className="hidden lg:inline text-slate-300">
              GSTIN: <strong className="text-white">19AABCU9603R1ZM</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="tel:+919830012345" 
              className="flex items-center gap-1 text-emerald-300 hover:text-emerald-100 font-semibold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Emergency Helpline: +91 98300 12345
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand Section */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Pill className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-serif">
                PRINCE MEDICAL HALL
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                Rx Certified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chemist & Druggist • High-Quality Pharmaceuticals & Surgical Supplies
            </p>
          </div>
        </div>

        {/* Quick Stock Status Alerts */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs">
          {lowStockCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Low Stock: <strong>{lowStockCount}</strong></span>
            </button>
          )}

          {expiringCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Expiring Soon: <strong>{expiringCount}</strong></span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>POS Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            <span>Stock & Inventory</span>
            {(lowStockCount > 0 || expiringCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'prescription'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ScanLine className="w-4 h-4 text-emerald-300" />
            <span>AI Prescription OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'interactions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-indigo-300" />
            <span>Drug Interactions & Generic Finder</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'patients'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patients & Refills</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales & Analytics</span>
          </button>
        </div>
      </div>
    </header>
  );
};

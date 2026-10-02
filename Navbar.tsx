import React from 'react';
import { ShieldCheck, AlertTriangle, Layers, RotateCcw, TrendingUp, PackageCheck, ShoppingBag, Navigation, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData: () => void;
  frictionCount: number;
  totalOrders: number;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  frictionCount,
  totalOrders,
  loading,
}) => {
  const tabs = [
    { id: 'diagnosis', label: 'Problem Diagnosis', icon: AlertTriangle, badge: null },
    {
      id: 'triage',
      label: 'Live Operations & Triage',
      icon: PackageCheck,
      badge: frictionCount > 0 ? `${frictionCount} Friction` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'map', label: 'Live Delivery Map', icon: Navigation, badge: 'Swiggy ETA', badgeColor: 'bg-emerald-500/30 text-emerald-200' },
    { id: 'inventory', label: 'Inventory Risk Shield', icon: Layers, badge: 'Phantom Gate' },
    { id: 'second-order', label: '2nd-Order Restock Loop', icon: ShoppingBag, badge: 'Retention' },
    { id: 'impact', label: 'Financial ROI & Impact', icon: TrendingUp, badge: '₹25L Budget' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">NOVA CART</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Reliance Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Dark-Store Friction Mitigation & Second-Order Retention System</p>
            </div>
          </div>

          {/* Operational Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>4 Dark Stores Active</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Friction Risk:</span>
              <span className={`font-semibold ${frictionCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {frictionCount} / {totalOrders} Orders
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Budget Cap:</span>
              <span className="font-semibold text-emerald-400">₹18.5L / ₹25.0L</span>
            </div>
          </div>

          {/* Actions: Download ZIP & Reset Demo Data */}
          <div className="flex items-center space-x-2.5">
            <a
              href="/novacart-business-rescue-final.zip"
              download="novacart-business-rescue-final.zip"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition"
              title="Download full project ZIP (frontend + backend + docs + db)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ZIP</span>
            </a>

            <button
              onClick={onResetData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
              title="Reset SQLite database with initial case scenarios"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      tab.badgeColor || (isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-700 text-slate-300')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

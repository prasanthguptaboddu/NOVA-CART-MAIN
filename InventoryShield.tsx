import React, { useState } from 'react';
import { Layers, AlertCircle, ShieldAlert, CheckCircle2, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product, Store } from '../types.ts';

interface InventoryShieldProps {
  products: Product[];
  stores: Store[];
  onAuditProduct: (productId: string, physicalCount: number, reason: string) => Promise<void>;
  onQuarantineProduct: (productId: string) => Promise<void>;
}

export const InventoryShield: React.FC<InventoryShieldProps> = ({
  products,
  stores,
  onAuditProduct,
  onQuarantineProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditingProductId, setAuditingProductId] = useState<string | null>(null);
  const [auditPhysicalStock, setAuditPhysicalStock] = useState<number>(0);
  const [auditReason, setAuditReason] = useState<string>('Physical cycle count verified by picker');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (riskFilter === 'high' && p.phantom_risk_score <= 0.5) return false;
    if (riskFilter === 'safe' && p.phantom_risk_score > 0.5) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const highRiskCount = products.filter((p) => p.phantom_risk_score > 0.6).length;

  const handleOpenAudit = (product: Product) => {
    setAuditingProductId(product.id);
    setAuditPhysicalStock(product.shelf_stock);
    setAuditReason('Physical cycle count verified by picker');
  };

  const handleSaveAudit = async () => {
    if (!auditingProductId) return;
    setSubmitting(true);
    try {
      await onAuditProduct(auditingProductId, auditPhysicalStock, auditReason);
      setAuditingProductId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Risk Overview */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Pre-Checkout Inventory Risk Shield</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Algorithmic Phantom Stock Detection & Catalog Gate
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Phantom stockouts (where an item shows available in the app but is missing on the shelf) cause <strong>49.6%</strong> of all NOVA CART first-order friction events. The Shield quarantines erratic SKUs and prompts proactive shelf audits.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/90 p-3.5 rounded-xl border border-rose-900/40">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <div className="text-xs text-slate-400">Phantom Drift Alert:</div>
            <div className="text-lg font-bold text-rose-400">{highRiskCount} High-Risk SKUs</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-850/90 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                riskFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setRiskFilter('high')}
              className={`px-3 py-1 rounded-lg transition ${
                riskFilter === 'high' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              High Risk ({highRiskCount})
            </button>
            <button
              onClick={() => setRiskFilter('safe')}
              className={`px-3 py-1 rounded-lg transition ${
                riskFilter === 'safe' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Healthy
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Product & SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Physical Shelf Stock</th>
                <th className="py-3 px-4 font-semibold">App Catalog Stock</th>
                <th className="py-3 px-4 font-semibold">Phantom Risk Score</th>
                <th className="py-3 px-4 font-semibold">Drift Diagnostics</th>
                <th className="py-3 px-4 font-semibold text-right">Shield Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((p) => {
                const isHighRisk = p.phantom_risk_score > 0.6;
                const isMismatch = p.shelf_stock !== p.app_stock;

                return (
                  <tr
                    key={p.id}
                    className={`transition hover:bg-slate-750/50 ${
                      isHighRisk ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.sku} • ₹{p.price} • {p.unit}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold text-sm ${
                          p.shelf_stock === 0 ? 'text-rose-400' : 'text-slate-200'
                        }`}
                      >
                        {p.shelf_stock} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-200">{p.app_stock} units</span>
                        {isMismatch && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300"
                            title="Drift between App and Shelf"
                          >
                            MISMATCH
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, p.phantom_risk_score * 100)}%` }}
                          ></div>
                        </div>
                        <span
                          className={`font-bold ${
                            isHighRisk ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {(p.phantom_risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs">
                      {p.drift_reason ? (
                        <span className="text-amber-300/90">{p.drift_reason}</span>
                      ) : (
                        <span className="text-slate-500">Verified balanced batch</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAudit(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                      >
                        Audit Shelf
                      </button>

                      {isHighRisk && p.app_stock > 0 && (
                        <button
                          onClick={() => onQuarantineProduct(p.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
                          title="Set app stock to 0 to prevent customer stockout"
                        >
                          Quarantine
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      {auditingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Perform Physical Shelf Count Audit</span>
            </h3>

            <p className="text-xs text-slate-300">
              Update physical units counted on dark-store shelf. This will synchronize the consumer app catalog and clear the phantom risk score in the database.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Actual Physical Shelf Count (Units):
                </label>
                <input
                  type="number"
                  min="0"
                  value={auditPhysicalStock}
                  onChange={(e) => setAuditPhysicalStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Audit Notes / Shrinkage Reason:
                </label>
                <input
                  type="text"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => setAuditingProductId(null)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAudit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Updating Database...' : 'Save & Sync Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

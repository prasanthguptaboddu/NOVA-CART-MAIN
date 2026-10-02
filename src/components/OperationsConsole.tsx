import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Gift,
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Navigation,
} from 'lucide-react';
import { Order, Store } from '../types.ts';

interface OperationsConsoleProps {
  orders: Order[];
  stores: Store[];
  onRefresh: () => void;
  onAutoSubstitute: (orderId: string, itemId: string) => Promise<void>;
  onResolveFriction: (orderId: string, actionType: string) => Promise<void>;
  onPickItem: (orderId: string, itemId: string, status: 'PICKED' | 'OUT_OF_STOCK') => Promise<void>;
  onTrackOnMap?: (orderId: string) => void;
}

export const OperationsConsole: React.FC<OperationsConsoleProps> = ({
  orders,
  stores,
  onRefresh,
  onAutoSubstitute,
  onResolveFriction,
  onPickItem,
  onTrackOnMap,
}) => {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [filterFrictionOnly, setFilterFrictionOnly] = useState<boolean>(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (selectedStore !== 'all' && o.store_id !== selectedStore) return false;
    if (filterFrictionOnly && o.friction_type === 'NONE') return false;
    return true;
  });

  const handleSubstitute = async (orderId: string, itemId: string) => {
    setProcessingOrderId(orderId);
    try {
      await onAutoSubstitute(orderId, itemId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRescue = async (orderId: string, actionType: string) => {
    setProcessingOrderId(orderId);
    try {
      await onResolveFriction(orderId, actionType);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header & Store Control */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Live Dark-Store Dispatch & Friction Triage Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fulfillment tracking across 4 Bangalore dark stores. Intervene before SLA breach to protect 2nd-order retention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Dark Stores ({stores.length})</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.locality} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterFrictionOnly(!filterFrictionOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
              filterFrictionOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {filterFrictionOnly ? 'Showing Friction Hotspots' : 'Filter Friction Only'}
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            title="Refresh order queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dark Stores Operational Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stores.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedStore(s.id === selectedStore ? 'all' : s.id)}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              selectedStore === s.id
                ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50'
                : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-white tracking-wide">{s.code}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.status === 'CONGESTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : s.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {s.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-1">{s.locality}</div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div>
                <span>Avg Pick Time:</span>
                <div className="font-bold text-slate-200">{s.avg_pick_time_mins}m / {s.sla_minutes}m SLA</div>
              </div>
              <div>
                <span>Phantom SKUs:</span>
                <div className={`font-bold ${s.phantom_sku_count > 10 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {s.phantom_sku_count} flagged
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Active Queue: Showing {filteredOrders.length} Orders</span>
          <span>Click any action to execute real SQLite database updates</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-800">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-white">No active orders match the criteria</h3>
            <p className="text-xs text-slate-400 mt-1">All dark-store queues are currently optimal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const hasFriction = order.friction_type !== 'NONE';
              const isResolved = order.friction_resolved === 1;

              return (
                <div
                  key={order.id}
                  className={`bg-slate-800/90 rounded-2xl p-5 border transition shadow-sm ${
                    hasFriction && !isResolved
                      ? 'border-rose-700/80 bg-gradient-to-r from-rose-950/20 to-slate-800/90'
                      : isResolved
                      ? 'border-emerald-700/60 bg-gradient-to-r from-emerald-950/20 to-slate-800/90'
                      : 'border-slate-700/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Customer & Order Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-white">{order.order_number}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          {order.store_code}
                        </span>
                        {order.is_first_order === 1 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            1ST-TIME BUYER (CRITICAL)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            REPEAT BUYER (ORDER #{order.customer_total_orders})
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            order.status === 'PICKING'
                              ? 'bg-blue-500/20 text-blue-300'
                              : order.status === 'PACKED'
                              ? 'bg-teal-500/20 text-teal-300'
                              : order.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center space-x-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer_name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer_locality}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Placed: {new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span className="text-slate-300 font-semibold">
                          Total: ₹{order.total_amount} ({order.item_count} items)
                        </span>
                      </div>
                    </div>

                    {/* Churn Risk Gauge & Friction Status */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Customer Churn Risk</div>
                        <div
                          className={`text-sm font-extrabold ${
                            order.churn_risk_score > 0.6
                              ? 'text-rose-400'
                              : order.churn_risk_score > 0.3
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {(order.churn_risk_score * 100).toFixed(0)}%
                        </div>
                      </div>

                      {hasFriction && !isResolved && (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>{order.friction_type.replace('_', ' ')}</span>
                        </div>
                      )}

                      {isResolved && (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Friction Neutralized</span>
                        </div>
                      )}

                      {onTrackOnMap && (
                        <button
                          onClick={() => onTrackOnMap(order.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 text-xs font-semibold border border-slate-600 transition"
                          title="View live GPS delivery map and Swiggy-style ETA"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Track Map</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Items & Live Pick List */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/60">
                      <div className="text-xs font-semibold text-slate-300 mb-2">Dark-Store Picker Checklist:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                              item.pick_status === 'OUT_OF_STOCK'
                                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                                : item.pick_status === 'SUBSTITUTED'
                                ? 'bg-teal-950/40 border-teal-800 text-teal-200'
                                : item.pick_status === 'PICKED'
                                ? 'bg-slate-900/60 border-slate-700 text-slate-300'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-white">{item.product_name}</span>
                                <span className="text-[11px] text-slate-400 ml-2">Qty: {item.quantity}</span>
                              </div>
                              {item.substitute_product_name && (
                                <div className="mt-1 text-[11px] text-teal-300 font-medium">
                                  ↳ Substituted: {item.substitute_product_name}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  item.pick_status === 'OUT_OF_STOCK'
                                    ? 'text-rose-400'
                                    : item.pick_status === 'SUBSTITUTED'
                                    ? 'text-teal-400'
                                    : item.pick_status === 'PICKED'
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {item.pick_status}
                              </span>

                              {item.pick_status === 'OUT_OF_STOCK' && (
                                <button
                                  onClick={() => handleSubstitute(order.id, item.id)}
                                  disabled={processingOrderId === order.id}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-semibold transition disabled:opacity-50"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Auto-Substitute</span>
                                </button>
                              )}

                              {item.pick_status === 'PENDING' && (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => onPickItem(order.id, item.id, 'PICKED')}
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold"
                                  >
                                    Pick
                                  </button>
                                  <button
                                    onClick={() => onPickItem(order.id, item.id, 'OUT_OF_STOCK')}
                                    className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-semibold"
                                  >
                                    OOS
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operational Interventions & Rescue Trigger */}
                  {hasFriction && !isResolved && (
                    <div className="mt-4 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-rose-300">
                          Preemptive SLA & Retention Rescue Trigger
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Inject ₹50 instant wallet credit into {order.customer_name}&apos;s account with an automated SMS apology before they churn or file a ₹65 support ticket.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleRescue(order.id, 'PREEMPTIVE_WALLET_CREDIT')}
                          disabled={processingOrderId === order.id}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition disabled:opacity-50"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Preemptively Rescue (₹50 Credit)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interventions Audit Log */}
                  {order.interventions && order.interventions.length > 0 && (
                    <div className="mt-3 pt-2 text-[11px] text-slate-400 space-y-1">
                      <span className="font-semibold text-slate-300">Reliance Interventions Executed:</span>
                      {order.interventions.map((intv) => (
                        <div key={intv.id} className="flex items-center justify-between bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-emerald-300 font-medium">✓ {intv.title}: {intv.details}</span>
                          <span className="text-slate-400">Cost: ₹{intv.cost_inr} | LTV Protected: ₹{intv.ltv_protected_inr}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

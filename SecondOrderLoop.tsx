import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, ArrowRight, UserCheck, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { Customer } from '../types.ts';

interface SecondOrderLoopProps {
  customers: Customer[];
  onRefresh: () => void;
  onConvertOrder: (customerId: string, basketData: any) => Promise<void>;
}

export const SecondOrderLoop: React.FC<SecondOrderLoopProps> = ({
  customers,
  onRefresh,
  onConvertOrder,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [basketData, setBasketData] = useState<any>(null);
  const [loadingBasket, setLoadingBasket] = useState<boolean>(false);
  const [converting, setConverting] = useState<boolean>(false);
  const [convertedOrderResult, setConvertedOrderResult] = useState<any>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  useEffect(() => {
    if (selectedCustomer) {
      loadNextBasket(selectedCustomer.id);
    }
  }, [selectedCustomerId]);

  const loadNextBasket = async (customerId: string) => {
    setLoadingBasket(true);
    setConvertedOrderResult(null);
    try {
      const res = await fetch(`/api/customers/${customerId}/next-basket`);
      const json = await res.json();
      if (json.success) {
        setBasketData(json.data);
      }
    } catch (err) {
      console.error('Failed to load next basket:', err);
    } finally {
      setLoadingBasket(false);
    }
  };

  const handleCheckoutSecondOrder = async () => {
    if (!selectedCustomer || !basketData) return;
    setConverting(true);
    try {
      await onConvertOrder(selectedCustomer.id, {
        storeId: 'store-kor-104',
        items: basketData.suggestedItems,
        totalAmount: basketData.finalPayable,
      });
      setConvertedOrderResult({
        success: true,
        customerName: selectedCustomer.name,
        amount: basketData.finalPayable,
      });
      // reload
      await loadNextBasket(selectedCustomer.id);
    } catch (err) {
      console.error('Convert failed:', err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            <span>Second-Order Retention & Next-Basket Loop</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Friction-Aware Personalized Household Restock Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Instead of spraying blanket ₹150 vouchers (which bleed margins), the Reliance Engine uses verified consumption cycles to generate a frictionless 1-tap re-order basket with instant application of the customer&apos;s ₹50 Reliance Pass credit.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cohorts</span>
        </button>
      </div>

      {/* Main Split View: Customer Cohort Selector vs Basket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Cohort List */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Customer Conversion Queue</span>
            <span className="text-[11px] font-medium text-slate-400">{customers.length} Profiles</span>
          </h3>

          <div className="space-y-2.5">
            {customers.map((c) => {
              const isSelected = c.id === selectedCustomerId;
              const isConverted = c.second_order_converted === 1;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border text-xs transition ${
                    isSelected
                      ? 'bg-slate-750 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white">{c.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isConverted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.wallet_balance > 0
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isConverted ? 'CONVERTED (Order #2+)' : c.wallet_balance > 0 ? 'Rescued (₹50 Pass)' : 'Target Cohort'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">{c.locality}</div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">Total Orders: <strong className="text-slate-200">{c.total_orders}</strong></span>
                    <span className="text-slate-400">
                      Wallet: <strong className="text-emerald-400">₹{c.wallet_balance}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Next Basket Simulator */}
        <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between">
          {loadingBasket ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Calculating consumption cycle & pantry replenishment...</p>
            </div>
          ) : selectedCustomer && basketData ? (
            <div className="space-y-5">
              {/* Customer Profile Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/70">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">({selectedCustomer.phone})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preferred Slot: <strong>{selectedCustomer.preferred_delivery_slot}</strong> • Locality: <strong>{selectedCustomer.locality}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Churn Risk:</span>
                    <span
                      className={`text-sm font-bold ${
                        selectedCustomer.churn_risk_score > 0.5
                          ? 'text-rose-400'
                          : selectedCustomer.churn_risk_score > 0.2
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {(selectedCustomer.churn_risk_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="border-l border-slate-700 pl-3">
                    <span className="text-[11px] text-slate-400 block">Reliance Pass Wallet:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      ₹{selectedCustomer.wallet_balance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Converted Banner */}
              {convertedOrderResult && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-300 block">
                      Order #2 Successfully Placed & Customer Retained!
                    </span>
                    <span className="text-slate-300">
                      Converted {convertedOrderResult.customerName} for ₹{convertedOrderResult.amount} payable. Customer churn score dropped to 5%.
                    </span>
                  </div>
                </div>
              )}

              {/* Basket Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Algorithmic Pantry Restock Recommendations:</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Conversion Probability:{' '}
                    <strong className="text-emerald-400">
                      {(basketData.conversionLikelihood * 100).toFixed(0)}%
                    </strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {basketData.suggestedItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] text-teal-300/90 mt-0.5">
                          ↳ {item.replenishmentReason}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-white">
                          ₹{item.price * item.suggestedQuantity}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.suggestedQuantity} × ₹{item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary & Checkout */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({basketData.suggestedItems.length} items):</span>
                  <span className="text-slate-200">₹{basketData.basketTotal}</span>
                </div>

                {basketData.appliedWalletCredit > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Applied Reliance Pass Preemptive Credit:</span>
                    <span>-₹{basketData.appliedWalletCredit}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Net Payable for Order #2:</span>
                  <span className="text-emerald-400">₹{basketData.finalPayable}</span>
                </div>
              </div>

              {/* Conversion Trigger Button */}
              <div className="pt-2">
                <button
                  onClick={handleCheckoutSecondOrder}
                  disabled={converting || selectedCustomer.second_order_converted === 1}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>
                    {selectedCustomer.second_order_converted === 1
                      ? 'Customer Already Converted to Repeat Buyer'
                      : converting
                      ? 'Executing Order #2 in Database...'
                      : 'Simulate Customer One-Tap Restock (Order #2)'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">Select a customer from the left to view next basket</div>
          )}
        </div>
      </div>
    </div>
  );
};

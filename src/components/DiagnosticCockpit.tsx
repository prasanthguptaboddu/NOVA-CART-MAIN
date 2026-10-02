import React from 'react';
import { AlertOctagon, TrendingDown, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { SimulationMetrics } from '../types.ts';

interface DiagnosticCockpitProps {
  metrics: SimulationMetrics | null;
  onExploreTriage: () => void;
}

export const DiagnosticCockpit: React.FC<DiagnosticCockpitProps> = ({ metrics, onExploreTriage }) => {
  const caseFacts = metrics?.caseFacts || {
    company: 'NOVA CART',
    monthlyFirstTimeAcquisitions: 120000,
    baseline2ndOrderConversionPct: 19.4,
    firstOrderFrictionRatePct: 28.6,
    zeroFrictionRetentionPct: 42.1,
    frictionAfflictedRetentionPct: 8.6,
    retentionDestructionMultiplier: '4.9x drop upon experiencing friction',
    budgetConstraintINR: 2500000,
    averageOrderValueINR: 485.0,
  };

  const monthlyAcquisitions = caseFacts.monthlyFirstTimeAcquisitions;
  const frictionOrders = Math.round(monthlyAcquisitions * (caseFacts.firstOrderFrictionRatePct / 100));
  const smoothOrders = monthlyAcquisitions - frictionOrders;

  // Churn calculations
  const repeatersFromSmooth = Math.round(smoothOrders * (caseFacts.zeroFrictionRetentionPct / 100));
  const repeatersFromFriction = Math.round(frictionOrders * (caseFacts.frictionAfflictedRetentionPct / 100));
  const totalRepeatersBaseline = repeatersFromSmooth + repeatersFromFriction;
  const lostRepeatersDueToFriction = Math.round(frictionOrders * ((caseFacts.zeroFrictionRetentionPct - caseFacts.frictionAfflictedRetentionPct) / 100));
  const monthlyRevenueBleed = Math.round(lostRepeatersDueToFriction * caseFacts.averageOrderValueINR);

  return (
    <div className="space-y-6">
      {/* Top Banner: The Case Diagnosis */}
      <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Root Cause Diagnosis: The Fulfillment Friction & Second-Order Churn Loop</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Why NOVA CART Is Burning Cash Despite High First-Order Signups
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Customers are attracted by first-order vouchers (₹150 off), but <strong>28.6%</strong> of new buyers experience a critical operational friction event (phantom stockout or delivery delay). When friction occurs, second-order conversion collapses from <strong>42.1%</strong> down to <strong>8.6%</strong>.
            </p>
          </div>
          <button
            onClick={onExploreTriage}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition self-start lg:self-center whitespace-nowrap"
          >
            <span>Launch Live Triage Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Critical Baseline Case Facts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Monthly New Customers</span>
            <div className="text-2xl font-extrabold text-white mt-1">120,000</div>
            <p className="text-xs text-slate-500 mt-1">High acquisition through introductory voucher discounts</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-rose-900/40">
            <span className="text-xs text-rose-300 font-medium">1st-Order Friction Rate</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">28.6%</div>
            <p className="text-xs text-slate-400 mt-1">34,320 orders face phantom stockouts or SLA delays</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-900/40">
            <span className="text-xs text-amber-300 font-medium">Current 2nd-Order Repeat Rate</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">19.4%</div>
            <p className="text-xs text-slate-400 mt-1">Only 23,280 buyers ever return for order #2</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-900/40">
            <span className="text-xs text-emerald-300 font-medium">Implementation Budget Cap</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹25.0 Lakhs</div>
            <p className="text-xs text-slate-400 mt-1">Strict 6-month constraint. No expensive warehouses.</p>
          </div>
        </div>
      </div>

      {/* The Churn Chasm Visualizer: Evidence In Motion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <span>The Churn Chasm: Impact of 1st-Order Friction</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              4.9x Destruction
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            The data proves that repeat failure is NOT a marketing problem—it is an operational promise delivery failure.
          </p>

          <div className="space-y-4 mt-5">
            {/* Zero Friction Experience */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-800/40">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Smooth Order Experience (Zero Friction)</span>
                </span>
                <span className="text-emerald-400 font-bold text-base">42.1% Repeat Rate</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '42.1%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Customers receive all items on time. Organic habit formation triggers strong 2nd-order conversion.
              </p>
            </div>

            {/* Friction Experience */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-800/60">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-rose-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Friction Experience (Missing Item / SLA Delay)</span>
                </span>
                <span className="text-rose-400 font-bold text-base">8.6% Repeat Rate</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '8.6%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Customer experiences silent item drop, phantom stockout, or &gt;30 min delay. Trust broken permanently.
              </p>
            </div>
          </div>

          {/* Quantified Bleed Box */}
          <div className="mt-5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50">
            <div className="text-xs font-semibold text-rose-300 uppercase tracking-wide">Quantified Monthly Churn Leak</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-white">{lostRepeatersDueToFriction.toLocaleString()}</span>
              <span className="text-xs text-rose-300 font-medium">customers lost every month</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Worth <strong>₹{(monthlyRevenueBleed / 100000).toFixed(1)} Lakhs in lost repeat GMV every single month</strong>, while NOVA CART continues spending acquisition capital to replace them.
            </p>
          </div>
        </div>

        {/* Breakdown of 1st-Order Friction Symptoms & Strategic Root Cause */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Friction Breakdown & The 5-Point Reliance Solution</span>
            </h2>

            <div className="space-y-3 mt-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                  49.6%
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Phantom Stockouts at Shelf (14.2% of all 1st orders)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    App shows item in stock; picker discovers physical shelf count is 0. Results in uncommunicated item drops or last-second cancellations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
                  40.2%
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dark-Store SLA Delays (11.5% of all 1st orders)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Picking queue congestion exceeds 8 mins, causing delivery to take 30–45 mins against a 15–20 min promise.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-300 shrink-0">
                  10.2%
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Damaged Goods & Packing Errors (2.9% of all 1st orders)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Crushed egg trays, bruised tomatoes, or wrong variant packed without customer signoff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Reasoning Box */}
          <div className="mt-5 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
            <span className="font-semibold text-emerald-300">The Reliance Engine Strategy:</span>
            <p className="text-slate-300 mt-1">
              Rather than attempting to double rider headcount or open costly new dark stores (which exceeds the ₹25L budget), we deploy an <strong>algorithmic pre-checkout inventory gate</strong> + <strong>real-time picker substitution protocol</strong> + <strong>preemptive ₹50 credit injection for Order #2 before the customer ever complains</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

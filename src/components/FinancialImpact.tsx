import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SimulationMetrics } from '../types.ts';

interface FinancialImpactProps {
  metrics: SimulationMetrics | null;
}

export const FinancialImpact: React.FC<FinancialImpactProps> = ({ metrics }) => {
  const [frictionReductionPct, setFrictionReductionPct] = useState<number>(68);

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

  // Calculations based on slider
  const monthlyUsers = caseFacts.monthlyFirstTimeAcquisitions;
  const initialFrictionOrders = monthlyUsers * (caseFacts.firstOrderFrictionRatePct / 100); // 34,320
  const rescuedFrictionOrders = initialFrictionOrders * (frictionReductionPct / 100); // e.g. 23,338
  const remainingFrictionOrders = initialFrictionOrders - rescuedFrictionOrders;
  const smoothOrders = monthlyUsers - initialFrictionOrders + rescuedFrictionOrders;

  // Repeat orders calculated:
  const repeatersFromSmooth = smoothOrders * (caseFacts.zeroFrictionRetentionPct / 100);
  const repeatersFromFriction = remainingFrictionOrders * (caseFacts.frictionAfflictedRetentionPct / 100);
  const totalRepeatersSimulated = repeatersFromSmooth + repeatersFromFriction;

  const baselineRepeaters = monthlyUsers * (caseFacts.baseline2ndOrderConversionPct / 100);
  const incrementalRepeatersMonthly = totalRepeatersSimulated - baselineRepeaters;
  const newRepeatConversionRate = (totalRepeatersSimulated / monthlyUsers) * 100;

  const monthlyIncrementalGMV = incrementalRepeatersMonthly * caseFacts.averageOrderValueINR;
  const contributionMarginPct = 0.18; // 18% gross margin contribution on groceries
  const monthlyGrossProfit = monthlyIncrementalGMV * contributionMarginPct;

  // Support ticket savings (each friction order avoided saves ₹65 ticket cost)
  const monthlyTicketSavings = rescuedFrictionOrders * 0.22 * 65.0; // 22% ticket propensity * ₹65

  // 6-Month Projections
  const sixMonthNetProfit = (monthlyGrossProfit + monthlyTicketSavings) * 6;
  const sixMonthBudgetSpent = 1850000.0;
  const roiMultiple = (sixMonthNetProfit / sixMonthBudgetSpent).toFixed(1);
  const paybackMonths = (sixMonthBudgetSpent / (monthlyGrossProfit + monthlyTicketSavings)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Unit Economics & 6-Month Business Rescue Projection</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Financial Impact Model & Budget Compliance
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Grounded strictly in the <strong>₹25 Lakh budget constraint</strong>. Evaluates current state vs product assumptions vs projected returns.
            </p>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider block">
              Budget Utilization
            </span>
            <span className="text-lg font-extrabold text-white">₹18.5L / ₹25.0L Cap</span>
            <span className="text-[10px] text-emerald-400 block font-medium">₹6.5L (26%) Safety Buffer</span>
          </div>
        </div>

        {/* 3 Methodology Badges as required by Section 9 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-start space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
              CASE FACT
            </span>
            <p className="text-slate-300 text-[11px]">
              120k monthly first orders, 28.6% friction, 19.4% baseline repeat rate, 4.9x churn drop on friction.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-start space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] shrink-0 mt-0.5">
              ASSUMPTION
            </span>
            <p className="text-slate-300 text-[11px]">
              ₹485 average basket, 18% contribution margin, ₹65 support cost per ticket, ₹50 rescue credit cost.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-start space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] shrink-0 mt-0.5">
              PROJECTED RESULT
            </span>
            <p className="text-slate-300 text-[11px]">
              Second-order conversion lifted to ~35–38%, generating ₹1.19+ Cr net value in 6 months at 6.4x ROI.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sensitivity Controller */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Friction Mitigation Sensitivity Slider</h3>
              <p className="text-xs text-slate-400">
                Adjust the percentage of operational friction neutralized by the Reliance Engine:
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-teal-400">{frictionReductionPct}%</span>
            <span className="text-xs text-slate-400 block">Friction Reduction Target</span>
          </div>
        </div>

        <input
          type="range"
          min="40"
          max="85"
          step="1"
          value={frictionReductionPct}
          onChange={(e) => setFrictionReductionPct(parseInt(e.target.value, 10))}
          className="w-full mt-4 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />

        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
          <span>Conservative (40%)</span>
          <span>Target Case (68%)</span>
          <span>Optimistic (85%)</span>
        </div>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-400">2nd-Order Repeat Conversion</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {newRepeatConversionRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Up from baseline <strong>{caseFacts.baseline2ndOrderConversionPct}%</strong> (+
            {(newRepeatConversionRate - caseFacts.baseline2ndOrderConversionPct).toFixed(1)}pp lift)
          </p>
        </div>

        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-400">Monthly Incremental Repeat Orders</span>
          <div className="text-2xl font-black text-white mt-1">
            +{Math.round(incrementalRepeatersMonthly).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Worth <strong>₹{(monthlyIncrementalGMV / 100000).toFixed(1)} Lakhs</strong> in repeat monthly GMV
          </p>
        </div>

        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-400">6-Month Net Financial Gain</span>
          <div className="text-2xl font-black text-teal-400 mt-1">
            ₹{(sixMonthNetProfit / 100000).toFixed(1)} Lakhs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Margin contribution + support ticket OPEX saved
          </p>
        </div>

        <div className="bg-slate-800/90 p-5 rounded-2xl border border-emerald-800/60 bg-emerald-950/20">
          <span className="text-xs font-semibold text-emerald-300">Return on Implementation (ROI)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{roiMultiple}x</div>
          <p className="text-[11px] text-slate-300 mt-1">
            Payback achieved in <strong>{paybackMonths} months</strong>
          </p>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>6-Month Implementation Budget Allocation (₹25.0 Lakhs Cap)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Budget Category</th>
                <th className="py-2.5 px-4 font-semibold">Description & Deliverable</th>
                <th className="py-2.5 px-4 font-semibold">Allocated Spend</th>
                <th className="py-2.5 px-4 font-semibold">% of Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Preemptive Reliance Pass Credits</td>
                <td className="py-3 px-4 text-slate-300">
                  Targeted ₹50 second-order wallet credits for friction-impacted users
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-400">₹8,40,000</td>
                <td className="py-3 px-4 text-slate-400">33.6%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Software & Telephony Integration</td>
                <td className="py-3 px-4 text-slate-300">
                  Real-time inventory sync engine, SMS alerts, automated substitution API
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-400">₹4,80,000</td>
                <td className="py-3 px-4 text-slate-400">19.2%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Dark-Store Picker Incentives & Audit Tools</td>
                <td className="py-3 px-4 text-slate-300">
                  Per-audit cycle count bonus for dark store staff, barcoding accuracy incentives
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-400">₹3,60,000</td>
                <td className="py-3 px-4 text-slate-400">14.4%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Staff Training & Operations Oversight</td>
                <td className="py-3 px-4 text-slate-300">
                  4-week dark store supervisor training & quality audit protocols
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-400">₹1,70,000</td>
                <td className="py-3 px-4 text-slate-400">6.8%</td>
              </tr>
              <tr className="bg-emerald-950/20 font-bold">
                <td className="py-3 px-4 text-emerald-300">Total Operational Budget Spent</td>
                <td className="py-3 px-4 text-emerald-300">Comprehensive 6-Month Rollout</td>
                <td className="py-3 px-4 text-emerald-400">₹18,50,000</td>
                <td className="py-3 px-4 text-emerald-300">74.0%</td>
              </tr>
              <tr className="bg-slate-900/60 font-bold">
                <td className="py-3 px-4 text-slate-400">Safety Contingency Reserve</td>
                <td className="py-3 px-4 text-slate-400">Unallocated buffer remaining in bank</td>
                <td className="py-3 px-4 text-slate-200">₹6,50,000</td>
                <td className="py-3 px-4 text-slate-400">26.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

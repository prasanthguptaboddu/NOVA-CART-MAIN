import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Bike,
  Store as StoreIcon,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Order, Store } from '../types.ts';

interface DeliveryMapTrackerProps {
  orders: Order[];
  stores: Store[];
  selectedOrderId?: string | null;
  onSelectOrder?: (orderId: string) => void;
  onResolveFriction?: (orderId: string, actionType: string) => Promise<void>;
}

interface RiderInfo {
  name: string;
  phone: string;
  rating: number;
  tripsCount: number;
  vehicle: string;
  avatarUrl: string;
}

export const DeliveryMapTracker: React.FC<DeliveryMapTrackerProps> = ({
  orders,
  stores,
  selectedOrderId,
  onSelectOrder,
  onResolveFriction,
}) => {
  // Select active order or fallback to first order
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const activeStore = stores.find((s) => s.id === activeOrder?.store_id) || stores[0];

  // Rider simulation state (0 to 100 progress along route)
  const [progress, setProgress] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [callingRider, setCallingRider] = useState<boolean>(false);

  // Delivery partner profiles
  const riderProfiles: Record<string, RiderInfo> = {
    'ord-nc-8092': {
      name: 'Ramesh Kumar',
      phone: '+91 98860 41209',
      rating: 4.9,
      tripsCount: 1842,
      vehicle: 'Ather 450X EV (KA-01-EQ-9120)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    'ord-nc-8093': {
      name: 'Suresh Gowda',
      phone: '+91 97401 22819',
      rating: 4.8,
      tripsCount: 940,
      vehicle: 'TVS iQube Electric (KA-04-EV-3104)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    'ord-nc-8094': {
      name: 'Manjunath B.',
      phone: '+91 94490 88214',
      rating: 4.95,
      tripsCount: 2410,
      vehicle: 'Ola S1 Pro (KA-05-MK-1102)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
  };

  const rider = activeOrder
    ? riderProfiles[activeOrder.id] || {
        name: 'Sunil Gowda',
        phone: '+91 98450 77123',
        rating: 4.85,
        tripsCount: 1250,
        vehicle: 'Ather 450X EV (KA-01-TR-5521)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      }
    : riderProfiles['ord-nc-8092'];

  // Animate rider along the route
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 0.5 * simulationSpeed);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  // Reset or adjust progress when order changes
  useEffect(() => {
    if (activeOrder?.status === 'DELIVERED') {
      setProgress(100);
    } else if (activeOrder?.status === 'PICKING') {
      setProgress(20);
    } else if (activeOrder?.status === 'PACKED') {
      setProgress(40);
    } else {
      setProgress(65);
    }
  }, [activeOrder?.id, activeOrder?.status]);

  if (!activeOrder) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-800/80 rounded-2xl border border-slate-700">
        No active orders to track.
      </div>
    );
  }

  // Calculate dynamic ETA based on distance and SLA
  const totalDistanceKm = 2.4;
  const remainingDistanceKm = Math.max(0, totalDistanceKm * (1 - progress / 100)).toFixed(1);
  const totalPromisedMins = activeStore?.sla_minutes || 15;
  const initialRemainingMins = Math.max(1, Math.round(totalPromisedMins * (1 - progress / 100)));
  const hasFriction = activeOrder.friction_type !== 'NONE' && activeOrder.friction_resolved === 0;
  const displayEtaMins = hasFriction ? initialRemainingMins + 7 : initialRemainingMins;

  // Coordinates for Route Path (SVG representation of Bangalore street grid)
  // Store: (80, 240) -> Waypoints -> Customer: (420, 70)
  const storeX = 80;
  const storeY = 240;
  const destX = 420;
  const destY = 70;

  // Bezier waypoint path coordinates
  // Path: M 80,240 C 140,240 160,180 220,180 C 280,180 320,110 420,70
  // Compute interpolated point along the bezier curve
  const t = progress / 100;
  // Cubic Bezier interpolation: P0=(80,240), P1=(150,230), P2=(280,120), P3=(420,70)
  const p0 = { x: 80, y: 240 };
  const p1 = { x: 160, y: 220 };
  const p2 = { x: 270, y: 130 };
  const p3 = { x: 420, y: 70 };

  const riderX =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x;
  const riderY =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;

  return (
    <div className="space-y-6">
      {/* Top Banner: Swiggy-Style Order Selector & Live Pill */}
      <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Swiggy-Style Live GPS Order Tracking</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Tracking {activeOrder.order_number} ({activeOrder.customer_name})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time electric bike telematics from {activeStore.name} to {activeOrder.customer_locality}.
          </p>
        </div>

        {/* Order Selector Dropdown */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">Select Order:</label>
          <select
            value={activeOrder.id}
            onChange={(e) => onSelectOrder && onSelectOrder(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto font-medium"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} - {o.customer_name} ({o.status}
                {o.friction_type !== 'NONE' && o.friction_resolved === 0 ? ' • Delay Risk' : ''})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Swiggy Layout: 2 Columns (Map on Left, Swiggy Card on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Delivery Map (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Top Floating ETA Badge over Map (Iconic Swiggy pill) */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10 mb-3">
            <div className="flex items-center space-x-2.5 bg-slate-800/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 shadow-lg">
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Estimated Delivery Time
                </span>
                <span className="text-base font-extrabold text-white">
                  {progress >= 100
                    ? 'Delivered at Doorstep 🎉'
                    : `${displayEtaMins} MINS (${remainingDistanceKm} km away)`}
                </span>
              </div>
            </div>

            {hasFriction ? (
              <div className="flex items-center space-x-2 bg-rose-950/80 border border-rose-800/70 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 shadow-md">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Delayed due to {activeOrder.friction_type.replace('_', ' ')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-800/70 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 shadow-md">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>On-Time SLA Guarantee</span>
              </div>
            )}
          </div>

          {/* Map Graphic Canvas / Visual SVG */}
          <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Map Background Grid (Bangalore Urban Street Layout) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 500 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Street grid pattern */}
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                {/* Route Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100%" height="100%" fill="#090d16" />
              <rect width="100%" height="100%" fill="url(#street-grid)" />

              {/* Simulated Bangalore Arterial Roads */}
              {/* Intermediate Ring Road */}
              <line x1="20" y1="280" x2="480" y2="280" stroke="#1e293b" strokeWidth="12" />
              <line x1="20" y1="280" x2="480" y2="280" stroke="#334155" strokeWidth="2" strokeDasharray="6,6" />
              {/* 100ft Road */}
              <line x1="120" y1="20" x2="120" y2="280" stroke="#1e293b" strokeWidth="10" />
              {/* 80ft Road */}
              <line x1="340" y1="20" x2="340" y2="280" stroke="#1e293b" strokeWidth="8" />
              {/* Cross streets */}
              <line x1="40" y1="120" x2="460" y2="120" stroke="#1e293b" strokeWidth="6" />
              <line x1="40" y1="180" x2="460" y2="180" stroke="#1e293b" strokeWidth="6" />

              {/* Park green zone (e.g. Koramangala Park) */}
              <rect x="230" y="30" width="80" height="60" rx="10" fill="#064e3b" opacity="0.25" />
              <text x="270" y="65" fill="#10b981" fontSize="9" opacity="0.6" textAnchor="middle">
                BDA Park
              </text>

              {/* Street Names */}
              <text x="250" y="275" fill="#475569" fontSize="8" textAnchor="middle" letterSpacing="1">
                KORAMANGALA 100FT RING ROAD
              </text>
              <text x="345" y="100" fill="#475569" fontSize="7" transform="rotate(90 345 100)">
                12TH MAIN ROAD
              </text>

              {/* The Delivery Route Path */}
              {/* Planned route shadow */}
              <path
                d="M 80 240 C 160 220 270 130 420 70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Traveled Route Line (glowing emerald) */}
              <path
                d="M 80 240 C 160 220 270 130 420 70"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
              />
              {/* Dotted target trajectory */}
              <path
                d="M 80 240 C 160 220 270 130 420 70"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4,5"
                strokeLinecap="round"
              />

              {/* START PIN: NOVA CART Dark Store */}
              <g transform={`translate(${storeX}, ${storeY})`}>
                <circle r="14" fill="#064e3b" opacity="0.7" />
                <circle r="9" fill="#10b981" />
                <circle r="4" fill="#ffffff" />
                <text x="0" y="24" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {activeStore.code}
                </text>
              </g>

              {/* DESTINATION PIN: Customer Doorstep */}
              <g transform={`translate(${destX}, ${destY})`}>
                <circle r="16" fill="#1e3a8a" opacity="0.7" className="animate-ping" />
                <circle r="10" fill="#3b82f6" />
                <circle r="5" fill="#ffffff" />
                <text x="0" y="-14" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {activeOrder.customer_name.split(' ')[0]}&apos;s Home
                </text>
              </g>

              {/* MOVING RIDER MARKER */}
              <g transform={`translate(${riderX}, ${riderY})`}>
                {/* Pulsing radar circle */}
                <circle r="16" fill="#10b981" opacity="0.3" className="animate-pulse" />
                <circle r="10" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                {/* Mini bike direction icon */}
                <circle r="4" fill="#10b981" />
                <text x="0" y="18" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  🛵 {rider.name.split(' ')[0]}
                </text>
              </g>
            </svg>

            {/* Bottom Floating Map Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  title={isPlaying ? 'Pause Simulation' : 'Resume Rider'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setProgress(0)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Reset to Store"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[11px] ml-1">
                  <span>Speed:</span>
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimulationSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulationSpeed === s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center space-x-2 w-40 sm:w-56">
                <span className="text-[10px] text-slate-400 font-mono">{progress.toFixed(0)}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Route Leg Description */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center space-x-1">
              <StoreIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeStore.name}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1">
              <Bike className="w-3.5 h-3.5 text-teal-400" />
              <span>En route via 100ft Road</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeOrder.customer_locality}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Swiggy Instamart Order & Delivery Partner Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Swiggy Instamart Brand Status Card */}
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-4">
            {/* Header: ETA & Live Milestone Progress */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Swiggy-Style Live Status</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono font-bold">
                  {activeOrder.order_number}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">
                  {progress >= 100 ? (
                    'Order Delivered'
                  ) : (
                    <>
                      Arriving in <span className="text-emerald-400">{displayEtaMins} mins</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {progress >= 100
                    ? `Order safely handed over at ${activeOrder.customer_locality}`
                    : `Your delivery partner is navigating through 100ft Rd to your doorstep.`}
                </p>
              </div>
            </div>

            {/* 4-Step Milestone Progress Bar */}
            <div className="pt-2">
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold mb-1.5">
                <span className="text-emerald-400">Placed</span>
                <span className={progress >= 25 ? 'text-emerald-400' : 'text-slate-500'}>Packed</span>
                <span className={progress >= 50 ? 'text-emerald-400' : 'text-slate-500'}>En Route</span>
                <span className={progress >= 100 ? 'text-emerald-400' : 'text-slate-500'}>Doorstep</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Delivery Partner Profile Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={rider.avatarUrl}
                  alt={rider.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/80 shadow-md"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-white">{rider.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {rider.rating} ★
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rider.vehicle}</div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Verified Partner • {rider.tripsCount.toLocaleString()} deliveries
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCallingRider(true);
                  setTimeout(() => setCallingRider(false), 3000);
                }}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition active:scale-95"
                title="Call Delivery Partner"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {callingRider && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-xs text-emerald-200 animate-in fade-in">
                📞 Connecting encrypted proxy call to {rider.name} ({rider.phone})...
              </div>
            )}

            {/* Preemptive SLA Rescue Guarantee Card */}
            {hasFriction ? (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>SLA Risk Detected</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    +7m Delay
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Fulfillment lag occurred at the store. Click below to execute the Reliance Preemptive Rescue credit:
                </p>
                {onResolveFriction && (
                  <button
                    onClick={() => onResolveFriction(activeOrder.id, 'PREEMPTIVE_WALLET_CREDIT')}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow"
                  >
                    Credit ₹50 Reliance Pass to Customer Wallet
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block">NOVA CART 15-Minute Reliance SLA</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Your order is tracked by our dark-store telemetry. If delivery breaches the promised time, ₹50 is automatically credited for Order #2.
                  </p>
                </div>
              </div>
            )}

            {/* Bag Contents Accordion */}
            <div className="border-t border-slate-700/70 pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Items in Bag ({activeOrder.item_count} items):</span>
                <span className="text-white font-bold">₹{activeOrder.total_amount}</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]"
                  >
                    <span className="text-slate-200">
                      {item.quantity}× {item.product_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        item.pick_status === 'OUT_OF_STOCK'
                          ? 'text-rose-400'
                          : item.pick_status === 'SUBSTITUTED'
                          ? 'text-teal-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.pick_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

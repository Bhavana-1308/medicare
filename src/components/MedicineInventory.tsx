import React, { useState, useEffect } from 'react';
import { Medicine, UserProfile } from '../types';
import { StorageService, getTodayString } from '../services/storage';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  X,
} from 'lucide-react';

interface MedicineInventoryProps {
  currentUser: UserProfile;
}

export const MedicineInventory: React.FC<MedicineInventoryProps> = ({ currentUser }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lowStock' | 'expiryAlerts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refillMed, setRefillMed] = useState<Medicine | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(10);

  const loadData = () => {
    setMedicines(StorageService.getMedicines(currentUser.uid));
  };

  useEffect(() => {
    loadData();

    const handleChanged = () => {
      loadData();
    };

    window.addEventListener('medicare_data_changed', handleChanged);
    return () => {
      window.removeEventListener('medicare_data_changed', handleChanged);
    };
  }, [currentUser.uid]);

  const todayStr = getTodayString();

  // Helper to determine status
  const getInventoryStatus = (med: Medicine) => {
    const isOutOfStock = med.stock === 0;
    const isLowStock = !isOutOfStock && med.stock <= med.lowStockLimit;

    const isExpired = med.expiryDate && med.expiryDate < todayStr;
    const daysUntilExpiry = med.expiryDate
      ? Math.round(
          (new Date(med.expiryDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
        )
      : 999;
    const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

    return {
      isOutOfStock,
      isLowStock,
      isExpired,
      isExpiringSoon,
      daysUntilExpiry,
    };
  };

  // Metrics
  const totalPills = medicines.reduce((acc, m) => acc + (m.stock || 0), 0);
  const outOfStockMeds = medicines.filter((m) => m.stock === 0);
  const lowStockMeds = medicines.filter((m) => m.stock > 0 && m.stock <= m.lowStockLimit);
  const expiredMeds = medicines.filter((m) => m.expiryDate && m.expiryDate < todayStr);
  const expiringSoonMeds = medicines.filter((m) => {
    const status = getInventoryStatus(m);
    return status.isExpiringSoon;
  });

  // Filtered
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const status = getInventoryStatus(med);
    if (activeTab === 'lowStock') return status.isOutOfStock || status.isLowStock;
    if (activeTab === 'expiryAlerts') return status.isExpired || status.isExpiringSoon;
    return true;
  });

  const handleApplyRefill = () => {
    if (refillMed && refillAmount > 0) {
      StorageService.refillStock(refillMed.medicineId, Number(refillAmount));
      setRefillMed(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Medicine Stock & Expiry Inventory
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Real-time stock depletion tracking, automated threshold warnings, and critical expiration safeguards.
        </p>
      </div>

      {/* Top 4 Alert & Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Out of Stock Alert */}
        <div
          onClick={() => setActiveTab('lowStock')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            outOfStockMeds.length > 0
              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Out of Stock
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                outOfStockMeds.length > 0 ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              outOfStockMeds.length > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {outOfStockMeds.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {outOfStockMeds.length > 0 ? 'Urgent refill required' : 'No medicines at 0 stock'}
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => setActiveTab('lowStock')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            lowStockMeds.length > 0
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                lowStockMeds.length > 0
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              lowStockMeds.length > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {lowStockMeds.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {lowStockMeds.length > 0 ? 'At or below threshold' : 'All stocks adequate'}
          </div>
        </div>

        {/* Expired Alert */}
        <div
          onClick={() => setActiveTab('expiryAlerts')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            expiredMeds.length > 0
              ? 'bg-rose-50/70 border-rose-300'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expired Alert
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                expiredMeds.length > 0 ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              expiredMeds.length > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {expiredMeds.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {expiredMeds.length > 0 ? 'Do not consume' : 'No expired medications'}
          </div>
        </div>

        {/* Expiring Soon (< 30 days) */}
        <div
          onClick={() => setActiveTab('expiryAlerts')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            expiringSoonMeds.length > 0
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expiring Soon
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                expiringSoonMeds.length > 0
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              expiringSoonMeds.length > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {expiringSoonMeds.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Expiring in &le; 30 days</div>
        </div>
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Inventory ({medicines.length})
            </button>
            <button
              onClick={() => setActiveTab('lowStock')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'lowStock'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low / Zero Stock ({lowStockMeds.length + outOfStockMeds.length})
            </button>
            <button
              onClick={() => setActiveTab('expiryAlerts')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'expiryAlerts'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expiry Warnings ({expiredMeds.length + expiringSoonMeds.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Medicine Name</th>
                <th className="py-3.5 px-4">Form & Dosage</th>
                <th className="py-3.5 px-4">Available Stock</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Expiry Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const status = getInventoryStatus(med);

                return (
                  <tr
                    key={med.medicineId}
                    className={`hover:bg-slate-50/70 transition ${
                      status.isExpired
                        ? 'bg-rose-50/30'
                        : status.isOutOfStock
                        ? 'bg-rose-50/20'
                        : status.isLowStock
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    {/* Medicine */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {med.name}
                      <span className="block text-xs font-normal text-slate-400">
                        Prescribed {med.frequency}
                      </span>
                    </td>

                    {/* Form & Dosage */}
                    <td className="py-4 px-4 text-xs">
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {med.dosage}
                      </span>
                      <span className="ml-2 capitalize text-slate-500">{med.form}</span>
                    </td>

                    {/* Available Stock & Progress Bar */}
                    <td className="py-4 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">
                          {med.stock} units
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Limit: {med.lowStockLimit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status.isOutOfStock
                              ? 'bg-rose-500'
                              : status.isLowStock
                              ? 'bg-amber-500'
                              : 'bg-teal-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(4, (med.stock / Math.max(med.lowStockLimit * 3, 20)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-4 px-4">
                      {status.isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                          <ShieldAlert className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : status.isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-700">
                      {med.expiryDate || 'N/A'}
                    </td>

                    {/* Expiry Status Badge */}
                    <td className="py-4 px-4">
                      {status.isExpired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Expired
                        </span>
                      ) : status.isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Expires in {status.daysUntilExpiry}d
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Valid
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setRefillMed(med);
                          setRefillAmount(15);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Refill</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refill Quantity Modal */}
      {refillMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Refill Medicine Stock</h3>
              <button
                onClick={() => setRefillMed(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Adding units to <strong className="text-slate-900">{refillMed.name}</strong>.
              Current stock: <strong className="text-teal-700">{refillMed.stock}</strong>.
            </p>

            <div className="my-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Quantity to Add:
              </label>
              <div className="flex gap-2 mb-3">
                {[10, 20, 30, 60].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRefillAmount(amt)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                      refillAmount === amt
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                value={refillAmount}
                onChange={(e) => setRefillAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500"
                placeholder="Custom quantity..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRefillMed(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRefill}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm (+{refillAmount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

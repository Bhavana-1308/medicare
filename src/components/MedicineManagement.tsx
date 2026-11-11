import React, { useState, useEffect } from 'react';
import { Medicine, UserProfile } from '../types';
import { StorageService, formatTime12h, getTodayString } from '../services/storage';
import { AddEditMedicineModal } from './AddEditMedicineModal';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  CheckCircle2,
  Package,
  Sparkles,
} from 'lucide-react';

interface MedicineManagementProps {
  currentUser: UserProfile;
}

export const MedicineManagement: React.FC<MedicineManagementProps> = ({ currentUser }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lowStock' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadMedicines = () => {
    const list = StorageService.getMedicines(currentUser.uid);
    setMedicines(list);
  };

  useEffect(() => {
    loadMedicines();

    const handleChanged = () => {
      loadMedicines();
    };

    window.addEventListener('medicare_data_changed', handleChanged);
    return () => {
      window.removeEventListener('medicare_data_changed', handleChanged);
    };
  }, [currentUser.uid]);

  const handleSave = (medData: Omit<Medicine, 'medicineId' | 'createdAt'>) => {
    if (editingMedicine) {
      StorageService.updateMedicine(editingMedicine.medicineId, medData);
    } else {
      StorageService.addMedicine(medData);
    }
    setEditingMedicine(null);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteMedicine(id);
    setDeleteConfirmId(null);
  };

  const todayStr = getTodayString();

  // Filter & Search
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const isExpired = m.expiryDate && m.expiryDate < todayStr;
    const isLowStock = m.stock <= m.lowStockLimit;

    if (statusFilter === 'lowStock') return isLowStock;
    if (statusFilter === 'expired') return isExpired;
    if (statusFilter === 'active') return !isExpired;

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medicine Prescriptions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage dosages, schedules, and pill inventory synchronized with Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMedicine(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medicine name, dosage, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({medicines.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'active'
                  ? 'bg-white text-teal-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('lowStock')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'lowStock'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'expired'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expired
            </button>
          </div>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Display */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 -rotate-45" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Medicines Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No prescriptions matching "${searchQuery}". Try a different search term or filter.`
              : 'Add your prescribed medicines to configure dose timings and inventory alerts.'}
          </p>
          <button
            onClick={() => {
              setEditingMedicine(null);
              setIsModalOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const isLowStock = med.stock <= med.lowStockLimit;
            const isExpired = med.expiryDate && med.expiryDate < todayStr;
            const isExpiringSoon =
              med.expiryDate && !isExpired && (new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24) <= 30;

            return (
              <div
                key={med.medicineId}
                className={`bg-white rounded-3xl border p-5 transition-all hover:shadow-md flex flex-col justify-between ${
                  isExpired
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isLowStock
                    ? 'border-amber-300'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {med.form}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isExpired ? (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Expired
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expiring Soon
                        </span>
                      ) : null}

                      {isLowStock && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and dosage */}
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{med.name}</h3>
                  <p className="text-teal-700 font-bold text-sm mt-0.5">{med.dosage}</p>

                  {/* Instructions & Frequency */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg font-semibold border border-teal-100">
                      {med.frequency}
                    </span>
                    <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                      {med.instructions}
                    </span>
                  </div>

                  {/* Scheduled Times */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Dose Timings:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {med.times.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold"
                        >
                          {formatTime12h(t)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Available Stock:</span>
                      <span
                        className={`font-bold ${
                          med.stock === 0
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {med.stock} pills (Alert &le; {med.lowStockLimit})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          med.stock === 0
                            ? 'bg-rose-500'
                            : isLowStock
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (med.stock / (med.lowStockLimit * 3)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Expiry Date:</span>
                    <span className="font-mono font-medium">{med.expiryDate || 'N/A'}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => StorageService.refillStock(med.medicineId, 10)}
                      className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg transition"
                      title="Quick Refill +10 units"
                    >
                      +10 Refill
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingMedicine(med);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="Edit Medicine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(med.medicineId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Medicine</th>
                  <th className="py-3.5 px-4">Dosage</th>
                  <th className="py-3.5 px-4">Frequency</th>
                  <th className="py-3.5 px-4">Timings</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMedicines.map((med) => {
                  const isLowStock = med.stock <= med.lowStockLimit;
                  const isExpired = med.expiryDate && med.expiryDate < todayStr;

                  return (
                    <tr key={med.medicineId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {med.name}
                        <span className="block text-xs font-normal text-slate-400">
                          {med.form} • {med.instructions}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-teal-700">{med.dosage}</td>
                      <td className="py-3.5 px-4">{med.frequency}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {med.times.map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono"
                            >
                              {formatTime12h(t)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            isLowStock ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {med.stock}
                        </span>
                        {isLowStock && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {med.expiryDate}
                        {isExpired && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingMedicine(med);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-md"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(med.medicineId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSave}
        initialData={editingMedicine}
        userId={currentUser.uid}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Delete Medicine?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove this prescription? Scheduled reminders will also be discontinued.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

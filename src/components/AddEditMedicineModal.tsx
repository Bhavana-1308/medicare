import React, { useState, useEffect } from 'react';
import { Medicine, MedicineFrequency, MedicineForm, FoodInstruction } from '../types';
import { getTodayString } from '../services/storage';
import { X, Plus, Trash2, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface AddEditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Omit<Medicine, 'medicineId' | 'createdAt'>) => void;
  initialData?: Medicine | null;
  userId: string;
}

const COMMON_MEDICINE_SUGGESTIONS = [
  { name: 'Metformin Hydrochloride', dosage: '500 mg', form: 'tablet' as MedicineForm, instructions: 'After food' as FoodInstruction },
  { name: 'Paracetamol Dolo', dosage: '650 mg', form: 'tablet' as MedicineForm, instructions: 'After food' as FoodInstruction },
  { name: 'Amoxicillin Trihydrate', dosage: '500 mg', form: 'capsule' as MedicineForm, instructions: 'After food' as FoodInstruction },
  { name: 'Cetirizine HCl', dosage: '10 mg', form: 'tablet' as MedicineForm, instructions: 'Before sleep' as FoodInstruction },
  { name: 'Vitamin D3 Calci-Quick', dosage: '60,000 IU', form: 'capsule' as MedicineForm, instructions: 'With food' as FoodInstruction },
  { name: 'Pantoprazole Gastro', dosage: '40 mg', form: 'tablet' as MedicineForm, instructions: 'Empty stomach' as FoodInstruction },
  { name: 'Atorvastatin Calcium', dosage: '10 mg', form: 'tablet' as MedicineForm, instructions: 'Before sleep' as FoodInstruction },
  { name: 'Azithromycin', dosage: '500 mg', form: 'tablet' as MedicineForm, instructions: 'Before food' as FoodInstruction },
  { name: 'Cough Relief Syrup', dosage: '10 ml', form: 'syrup' as MedicineForm, instructions: 'After food' as FoodInstruction },
];

export const AddEditMedicineModal: React.FC<AddEditMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  userId,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<MedicineFrequency>('Twice daily');
  const [times, setTimes] = useState<string[]>(['08:00', '20:00']);
  const [newTimeInput, setNewTimeInput] = useState('12:00');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [stock, setStock] = useState<number>(30);
  const [lowStockLimit, setLowStockLimit] = useState<number>(8);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [instructions, setInstructions] = useState<FoodInstruction>('After food');
  const [color, setColor] = useState('teal');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosage(initialData.dosage);
      setFrequency(initialData.frequency);
      setTimes(initialData.times || ['08:00']);
      setStartDate(initialData.startDate || getTodayString());
      setEndDate(initialData.endDate || '');
      setStock(initialData.stock || 0);
      setLowStockLimit(initialData.lowStockLimit || 5);
      setExpiryDate(initialData.expiryDate || '');
      setNotes(initialData.notes || '');
      setForm(initialData.form || 'tablet');
      setInstructions(initialData.instructions || 'After food');
      setColor(initialData.color || 'teal');
    } else {
      // Default new medicine defaults
      setName('');
      setDosage('1 Tablet');
      setFrequency('Twice daily');
      setTimes(['08:30', '20:30']);
      setStartDate(getTodayString());
      const oneYearOut = new Date();
      oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
      setEndDate(oneYearOut.toISOString().split('T')[0]);
      setStock(30);
      setLowStockLimit(8);
      const sixMonthsOut = new Date();
      sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
      setExpiryDate(sixMonthsOut.toISOString().split('T')[0]);
      setNotes('');
      setForm('tablet');
      setInstructions('After food');
      setColor('teal');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Adjust timing presets when frequency changes
  const handleFrequencyChange = (freq: MedicineFrequency) => {
    setFrequency(freq);
    if (freq === 'Once daily') {
      setTimes(['09:00']);
    } else if (freq === 'Twice daily') {
      setTimes(['08:30', '20:30']);
    } else if (freq === 'Three times daily') {
      setTimes(['08:30', '14:00', '20:30']);
    } else if (freq === 'Four times daily') {
      setTimes(['08:00', '12:30', '17:00', '21:30']);
    }
  };

  const handleAddTime = () => {
    if (newTimeInput && !times.includes(newTimeInput)) {
      const updated = [...times, newTimeInput].sort();
      setTimes(updated);
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (times.length <= 1) {
      alert('A medicine must have at least one scheduled dose timing.');
      return;
    }
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleSelectSuggestion = (sug: typeof COMMON_MEDICINE_SUGGESTIONS[0]) => {
    setName(sug.name);
    setDosage(sug.dosage);
    setForm(sug.form);
    setInstructions(sug.instructions);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Medicine name is required.';
    if (!dosage.trim()) errs.dosage = 'Dosage is required (e.g. 500 mg, 1 tablet).';
    if (times.length === 0) errs.times = 'At least one dose time must be added.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (stock < 0) errs.stock = 'Stock quantity cannot be negative.';
    if (lowStockLimit < 0) errs.lowStockLimit = 'Low stock threshold cannot be negative.';
    if (!expiryDate) errs.expiryDate = 'Expiry date is required for medication safety.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      userId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times,
      startDate,
      endDate: endDate || '2099-12-31',
      stock: Number(stock),
      lowStockLimit: Number(lowStockLimit),
      expiryDate,
      notes: notes.trim(),
      form,
      instructions,
      color,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Edit Medicine Details' : 'Add New Medicine'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify dose schedule, pill stock, and safety parameters for Cloud Firestore.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        {!initialData && (
          <div className="mb-6 p-3 bg-teal-50/70 border border-teal-100 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDICINE_SUGGESTIONS.slice(0, 5).map((sug) => (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="text-xs bg-white hover:bg-teal-600 hover:text-white text-slate-700 px-2.5 py-1 rounded-lg border border-teal-200 transition font-medium"
                >
                  + {sug.name} ({sug.dosage})
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name and Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Medicine Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin Hydrochloride"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Form
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicineForm)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup (Liquid)</option>
                <option value="drops">Eye / Ear Drops</option>
                <option value="injection">Injection / Insulin</option>
                <option value="inhaler">Inhaler</option>
                <option value="cream">Cream / Ointment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Dosage and Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dosage (Strength / Quantity) *
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500 mg, 1 tablet, 10 ml"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${
                  errors.dosage
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
                }`}
              />
              {errors.dosage && <p className="text-xs text-rose-500 mt-1">{errors.dosage}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Food Instruction
              </label>
              <select
                value={instructions}
                onChange={(e) => setInstructions(e.target.value as FoodInstruction)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
              >
                <option value="After food">After food (Post-meal)</option>
                <option value="Before food">Before food (Pre-meal)</option>
                <option value="With food">With food (During meal)</option>
                <option value="Empty stomach">Empty stomach</option>
                <option value="Before sleep">Before sleep (Bedtime)</option>
                <option value="Anytime">Anytime</option>
              </select>
            </div>
          </div>

          {/* Row 3: Frequency and Dose Timings */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value as MedicineFrequency)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Custom">Custom Schedule</option>
                  <option value="As needed">As needed (SOS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Add Dose Timing
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                Configured Daily Alarm Times ({times.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-300 text-teal-800 text-xs font-bold rounded-xl shadow-2xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="text-slate-400 hover:text-rose-500 transition ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Stock & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Stock *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Low Stock Threshold *
              </label>
              <input
                type="number"
                min="0"
                value={lowStockLimit}
                onChange={(e) => setLowStockLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expiry Date *
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                  errors.expiryDate ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.expiryDate && <p className="text-xs text-rose-500 mt-1">{errors.expiryDate}</p>}
            </div>
          </div>

          {/* Row 5: Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Row 6: Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Prescription Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Doctor advises drinking plenty of warm water. Avoid dairy within 2 hours."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              {initialData ? 'Update Medicine' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

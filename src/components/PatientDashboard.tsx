import React, { useState, useEffect } from 'react';
import { UserProfile, Medicine, TodayDoseItem } from '../types';
import { StorageService, formatTime12h, getTodayString } from '../services/storage';
import { reminderService } from '../services/reminderService';
import { soundService } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  Bell,
  Sparkles,
  TrendingUp,
  Package,
  ArrowRight,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  Volume2,
} from 'lucide-react';

interface PatientDashboardProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: string) => void;
  onOpenAddMedicine: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onOpenAddMedicine,
}) => {
  const [schedule, setSchedule] = useState<TodayDoseItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    reminderService.getNotificationPermission()
  );

  const loadData = () => {
    const meds = StorageService.getMedicines(currentUser.uid);
    setMedicines(meds);
    const sched = StorageService.getTodaySchedule(currentUser.uid);
    setSchedule(sched);
  };

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('medicare_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('medicare_data_changed', handleDataChanged);
    };
  }, [currentUser.uid]);

  const handleMarkDose = (item: TodayDoseItem, status: 'taken' | 'skipped' | 'upcoming') => {
    StorageService.recordDoseStatus(item.medicine, item.date, item.time, status);

    if (status === 'taken') {
      soundService.playSuccessChime();

      // Check if all today's doses are now taken for celebration!
      const remaining = schedule.filter(
        (s) => s.id !== item.id && s.status !== 'taken' && s.status !== 'skipped'
      );
      if (remaining.length === 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const handleRequestPermission = async () => {
    const perm = await reminderService.requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      reminderService.triggerTestReminder();
    }
  };

  // Metrics
  const totalMedicines = medicines.length;
  const todayDoses = schedule.length;
  const takenDoses = schedule.filter((s) => s.status === 'taken').length;
  const missedDoses = schedule.filter((s) => s.status === 'missed').length;
  const skippedDoses = schedule.filter((s) => s.status === 'skipped').length;
  const lowStockCount = medicines.filter((m) => m.stock <= m.lowStockLimit).length;
  const adherencePercent = todayDoses > 0 ? Math.round((takenDoses / todayDoses) * 100) : 100;

  // Filter schedule by time slot
  const filteredSchedule = schedule.filter((item) => {
    if (activeFilter === 'all') return true;
    const hour = parseInt(item.time.split(':')[0], 10);
    if (activeFilter === 'morning') return hour < 12;
    if (activeFilter === 'afternoon') return hour >= 12 && hour < 17;
    if (activeFilter === 'evening') return hour >= 17;
    return true;
  });

  const nextDueDose = schedule.find((s) => s.status === 'due' || s.status === 'upcoming');

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Welcome & Next Dose Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-teal-100 text-sm mt-1 max-w-xl">
              {todayDoses > 0
                ? `You have completed ${takenDoses} of ${todayDoses} scheduled doses for today.`
                : 'No doses scheduled for today. Add your medicines to start receiving alerts.'}
            </p>
          </div>

          {/* Next Due Dose Pill */}
          {nextDueDose ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[260px]">
              <div className="text-[11px] uppercase tracking-wider font-bold text-teal-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Scheduled Dose</span>
              </div>
              <div className="mt-1 font-bold text-lg text-white truncate">
                {nextDueDose.medicine.name}
              </div>
              <div className="text-xs text-teal-100 mt-0.5 flex items-center justify-between">
                <span>{nextDueDose.medicine.dosage}</span>
                <span className="font-mono bg-teal-900/60 px-2 py-0.5 rounded text-white font-semibold">
                  {formatTime12h(nextDueDose.time)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-teal-300" />
              <div>
                <p className="font-bold text-white text-sm">All Doses Finished!</p>
                <p className="text-xs text-teal-200">Great job sticking to your prescription.</p>
              </div>
            </div>
          )}
        </div>

        {/* Browser Notification Banner if not granted */}
        {notificationPermission !== 'granted' && (
          <div className="mt-6 pt-4 border-t border-teal-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-teal-900/40 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 sm:px-8">
            <div className="flex items-center gap-2.5 text-xs text-teal-100">
              <Bell className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Enable browser notifications</strong> so you receive real-time audio and desktop chimes when medicines are due.
              </span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="text-xs font-bold px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl transition shadow-xs whitespace-nowrap"
            >
              Enable Notifications
            </button>
          </div>
        )}
      </div>

      {/* 5 Summary Cards (as explicitly specified in Section 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Medicines */}
        <div
          onClick={() => onNavigateTab('medicines')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Medicines
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalMedicines}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Prescriptions logged</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* 2. Today's Scheduled Doses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Doses
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{todayDoses}</div>
          <div className="mt-1 text-[11px] text-slate-400">Scheduled for today</div>
        </div>

        {/* 3. Doses Taken */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doses Taken
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{takenDoses}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {adherencePercent}% compliance today
          </div>
        </div>

        {/* 4. Missed / Skipped Doses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Missed / Skipped
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700">
            {missedDoses + skippedDoses}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {missedDoses} missed • {skippedDoses} skipped
          </div>
        </div>

        {/* 5. Low Stock Medicines */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className={`p-5 rounded-2xl border transition cursor-pointer group col-span-2 lg:col-span-1 ${
            lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-xs'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                lowStockCount > 0
                  ? 'bg-amber-200/70 text-amber-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              lowStockCount > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {lowStockCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{lowStockCount > 0 ? 'Requires refill' : 'All stocks healthy'}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Schedule Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Today's Medicine Schedule</span>
              <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full border border-teal-100">
                {schedule.length} Doses
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Check off your medications as you take them. Inventory stock is automatically updated.
            </p>
          </div>

          {/* Time Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('morning')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === 'morning'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Morning
            </button>
            <button
              onClick={() => setActiveFilter('afternoon')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === 'afternoon'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Afternoon
            </button>
            <button
              onClick={() => setActiveFilter('evening')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === 'evening'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evening / Night
            </button>
          </div>
        </div>

        {/* Schedule List */}
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Pill className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Doses Scheduled for this time</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeFilter === 'all'
                ? "You haven't added any medicines yet or none are scheduled for today."
                : `No doses scheduled in the ${activeFilter} window.`}
            </p>
            {activeFilter === 'all' && (
              <button
                onClick={onOpenAddMedicine}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Medicine</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredSchedule.map((item) => {
              const isTaken = item.status === 'taken';
              const isDue = item.status === 'due';
              const isSkipped = item.status === 'skipped';
              const isMissed = item.status === 'missed';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isTaken
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : isDue
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                      : isSkipped
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : isMissed
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isTaken
                          ? 'bg-emerald-500 text-white'
                          : isDue
                          ? 'bg-amber-500 text-white animate-bounce-once'
                          : isSkipped
                          ? 'bg-slate-200 text-slate-500'
                          : isMissed
                          ? 'bg-rose-500 text-white'
                          : 'bg-teal-50 text-teal-700 border border-teal-100'
                      }`}
                    >
                      {isTaken ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : isDue ? (
                        <Bell className="w-5 h-5 animate-pulse" />
                      ) : isSkipped ? (
                        <XCircle className="w-5 h-5" />
                      ) : isMissed ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Pill className="w-5 h-5 -rotate-45" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-bold text-base ${
                            isTaken ? 'text-slate-800 line-through' : 'text-slate-900'
                          }`}
                        >
                          {item.medicine.name}
                        </h3>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDue
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : isSkipped
                              ? 'bg-slate-200 text-slate-700'
                              : isMissed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isDue ? 'Due Now' : item.status}
                        </span>

                        {/* Stock warning pill */}
                        {item.medicine.stock <= item.medicine.lowStockLimit && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {item.medicine.stock} left
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">{item.medicine.dosage}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime12h(item.time)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium border border-teal-100/60">
                          {item.medicine.instructions}
                        </span>
                      </div>

                      {item.medicine.notes && (
                        <p className="mt-1.5 text-xs text-slate-500 italic max-w-xl">
                          "{item.medicine.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                    {!isTaken ? (
                      <>
                        <button
                          onClick={() => handleMarkDose(item, 'taken')}
                          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark as Taken</span>
                        </button>

                        <button
                          onClick={() => handleMarkDose(item, 'skipped')}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Skip</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </span>
                        <button
                          onClick={() => handleMarkDose(item, 'upcoming')}
                          className="text-xs text-slate-400 hover:text-slate-600 underline font-medium ml-2"
                        >
                          Undo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Bar for fast navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenAddMedicine}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 shadow-xs flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">Add New Medicine</div>
              <div className="text-xs text-slate-400">Configure dose timings & stock</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 shadow-xs flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">Medicine Inventory</div>
              <div className="text-xs text-slate-400">Refill pills & check expiry</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
        </button>

        <button
          onClick={() => reminderService.triggerTestReminder()}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 shadow-xs flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">Test Reminder Chime</div>
              <div className="text-xs text-slate-400">Simulate instant due notification</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
        </button>
      </div>
    </div>
  );
};

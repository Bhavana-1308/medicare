import React, { useState, useEffect } from 'react';
import { DoseLog, UserProfile, AdherenceStats } from '../types';
import { StorageService, formatTime12h, getTodayString } from '../services/storage';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Filter,
  Flame,
  Award,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DoseHistoryProps {
  currentUser: UserProfile;
}

export const DoseHistory: React.FC<DoseHistoryProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'taken' | 'skipped' | 'missed'>('all');
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');
  const [stats, setStats] = useState<AdherenceStats>({
    totalScheduled: 0,
    taken: 0,
    skipped: 0,
    missed: 0,
    upcoming: 0,
    percentage: 100,
    streakDays: 1,
  });

  const loadData = () => {
    const allLogs = StorageService.getDoseLogs(currentUser.uid);
    setLogs(allLogs);
    setStats(StorageService.getAdherenceStats(currentUser.uid, parseInt(timeRange, 10) || 7));
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
  }, [currentUser.uid, timeRange]);

  const todayStr = getTodayString();

  // Filter logs
  const filteredLogs = logs
    .filter((log) => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      if (timeRange !== 'all') {
        const days = parseInt(timeRange, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        if (log.date < cutoffStr) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date and time descending (latest first)
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.time.localeCompare(a.time);
    });

  // Calculate past 7 days breakdown for SVG chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayLogs = logs.filter((l) => l.date === dateStr);
    const taken = dayLogs.filter((l) => l.status === 'taken').length;
    const skipped = dayLogs.filter((l) => l.status === 'skipped').length;
    const missed = dayLogs.filter((l) => l.status === 'missed').length;
    const total = taken + skipped + missed;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

    return {
      date: dateStr,
      label: dayLabel,
      taken,
      skipped,
      missed,
      total,
      rate,
    };
  });

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export.');
      return;
    }
    const headers = ['Date', 'Time', 'Medicine Name', 'Dosage', 'Status', 'Logged At', 'Notes'];
    const rows = filteredLogs.map((l) => [
      l.date,
      l.time,
      `"${l.medicineName.replace(/"/g, '""')}"`,
      `"${l.dosage}"`,
      l.status,
      l.loggedAt,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediCare_Dose_History_${currentUser.name.replace(/\s+/g, '_')}_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dose History & Adherence Tracking
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Audit compliance logs, track adherence streaks, and visualize medication timing trends.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-2xl shadow-xs transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Adherence Visual Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Adherence Score Card */}
        <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-40 h-40 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                Adherence Rate ({timeRange === 'all' ? 'All Time' : `Past ${timeRange} Days`})
              </span>
              <Award className="w-5 h-5 text-teal-300" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{stats.percentage}%</span>
              <span className="text-xs font-semibold text-teal-200">
                {stats.percentage >= 90
                  ? 'Excellent'
                  : stats.percentage >= 75
                  ? 'Good'
                  : 'Needs Attention'}
              </span>
            </div>

            <p className="text-xs text-teal-100 mt-2 leading-relaxed">
              Based on {stats.taken} completed out of {stats.totalScheduled} total scheduled doses in this period.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-teal-600/60 flex items-center justify-between text-xs text-teal-200">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {stats.streakDays} Days Streak
            </span>
            <span>Target: 95%+</span>
          </div>
        </div>

        {/* 7-Day Adherence Visual Chart */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">7-Day Adherence Trend</h3>
              <p className="text-xs text-slate-400">Daily dose completion percentage</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Taken
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Missed/Skipped
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b border-slate-100">
            {last7Days.map((day) => {
              const heightPercent = day.total > 0 ? Math.max(15, day.rate) : 0;
              const isToday = day.date === todayStr;

              return (
                <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 mb-1 group-hover:text-teal-700 transition">
                    {day.total > 0 ? `${day.rate}%` : '-'}
                  </span>

                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-28 relative flex items-end overflow-hidden">
                    {day.total > 0 ? (
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          day.rate >= 90
                            ? 'bg-teal-500 group-hover:bg-teal-600'
                            : day.rate >= 60
                            ? 'bg-amber-400 group-hover:bg-amber-500'
                            : 'bg-rose-400 group-hover:bg-rose-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-slate-200" />
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs font-semibold ${
                      isToday ? 'text-teal-700 font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Doses automatically update your chart when marked in Today's Schedule.</span>
            <span className="font-semibold text-teal-700">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Filterable Dose Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* Status Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('taken')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                statusFilter === 'taken'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Taken ({logs.filter((l) => l.status === 'taken').length})
            </button>
            <button
              onClick={() => setStatusFilter('skipped')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                statusFilter === 'skipped'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skipped ({logs.filter((l) => l.status === 'skipped').length})
            </button>
            <button
              onClick={() => setStatusFilter('missed')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                statusFilter === 'missed'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missed ({logs.filter((l) => l.status === 'missed').length})
            </button>
          </div>

          {/* Timeframe Select */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Timeframe:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7' | '30' | 'all')}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-teal-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Dose Logs Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No medication records match the current filter. Mark doses in Today's Schedule to generate history entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Scheduled Time</th>
                  <th className="py-3 px-4">Medicine & Dosage</th>
                  <th className="py-3 px-4">Dose Status</th>
                  <th className="py-3 px-4">Logged Timestamp</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isSkipped = log.status === 'skipped';
                  const isMissed = log.status === 'missed';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-900">
                        {log.date}
                        {log.date === todayStr && (
                          <span className="ml-2 text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {formatTime12h(log.time)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{log.medicineName}</span>
                        <span className="ml-2 text-xs text-teal-700 font-semibold">{log.dosage}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSkipped
                              ? 'bg-slate-200 text-slate-700'
                              : isMissed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isTaken ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isSkipped ? (
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span className="capitalize">{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {log.loggedAt ? new Date(log.loggedAt).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 italic">
                        {log.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

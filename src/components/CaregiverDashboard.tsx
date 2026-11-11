import React, { useState, useEffect } from 'react';
import { UserProfile, Medicine, TodayDoseItem, DoseLog, AdherenceStats } from '../types';
import { StorageService, formatTime12h, getTodayString } from '../services/storage';
import { soundService } from '../services/sound';
import {
  HeartHandshake,
  UserPlus,
  UserCheck,
  Shield,
  Pill,
  Calendar,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Send,
  X,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CaregiverDashboardProps {
  currentUser: UserProfile;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ currentUser }) => {
  const [linkedPatients, setLinkedPatients] = useState<UserProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [patientMedicines, setPatientMedicines] = useState<Medicine[]>([]);
  const [patientSchedule, setPatientSchedule] = useState<TodayDoseItem[]>([]);
  const [patientLogs, setPatientLogs] = useState<DoseLog[]>([]);
  const [patientStats, setPatientStats] = useState<AdherenceStats | null>(null);

  // Link Patient Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkEmailInput, setLinkEmailInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  // Nudge alert state
  const [nudgeSent, setNudgeSent] = useState(false);

  const loadData = () => {
    // Refresh user object from storage
    const updatedUser = StorageService.getUserById(currentUser.uid) || currentUser;
    const allUsers = StorageService.getAllUsers();

    const linkedEmails = updatedUser.linkedPatients || [];
    const patients = allUsers.filter(
      (u) => u.role === 'patient' && linkedEmails.includes(u.email)
    );
    setLinkedPatients(patients);

    // If no patient selected yet or selected is no longer in list, pick the first
    if (patients.length > 0) {
      const active = selectedPatient
        ? patients.find((p) => p.uid === selectedPatient.uid) || patients[0]
        : patients[0];
      setSelectedPatient(active);
      loadPatientDetails(active.uid);
    } else {
      setSelectedPatient(null);
      setPatientMedicines([]);
      setPatientSchedule([]);
      setPatientLogs([]);
      setPatientStats(null);
    }
  };

  const loadPatientDetails = (patientUid: string) => {
    const meds = StorageService.getMedicines(patientUid);
    setPatientMedicines(meds);
    const sched = StorageService.getTodaySchedule(patientUid);
    setPatientSchedule(sched);
    const logs = StorageService.getDoseLogs(patientUid);
    setPatientLogs(logs);
    const stats = StorageService.getAdherenceStats(patientUid, 7);
    setPatientStats(stats);
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

  const handleSelectPatient = (patient: UserProfile) => {
    setSelectedPatient(patient);
    loadPatientDetails(patient.uid);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!linkEmailInput.trim()) {
      setLinkError('Please enter a patient email address.');
      return;
    }

    const result = StorageService.linkPatient(currentUser.email, linkEmailInput.trim());
    if (result.success) {
      setLinkSuccess(result.message);
      setLinkEmailInput('');
      setTimeout(() => {
        setIsLinkModalOpen(false);
        setLinkSuccess('');
      }, 1500);
    } else {
      setLinkError(result.message);
    }
  };

  const handleUnlink = (patientEmail: string) => {
    if (confirm(`Are you sure you want to unlink patient ${patientEmail}?`)) {
      StorageService.unlinkPatient(currentUser.email, patientEmail);
    }
  };

  const handleSendNudge = () => {
    soundService.playReminderChime();
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 3000);
  };

  const todayStr = getTodayString();
  const lowStockAlerts = patientMedicines.filter((m) => m.stock <= m.lowStockLimit);
  const expiredAlerts = patientMedicines.filter((m) => m.expiryDate && m.expiryDate < todayStr);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header with Link Patient CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              Caregiver Supervision Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Monitoring Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Oversee prescription adherence, verify taken/missed doses, and inspect stock depletion remotely.
          </p>
        </div>

        <button
          onClick={() => {
            setLinkError('');
            setLinkSuccess('');
            setIsLinkModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-sky-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Link Patient by Email</span>
        </button>
      </div>

      {/* Linked Patients Selector Row */}
      {linkedPatients.length > 0 ? (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monitored Patients ({linkedPatients.length}):
            </span>
            <span className="text-xs text-slate-500">Click a card to inspect medical profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {linkedPatients.map((patient) => {
              const isSelected = selectedPatient?.uid === patient.uid;
              const stats = StorageService.getAdherenceStats(patient.uid, 7);

              return (
                <div
                  key={patient.uid}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {patient.photoURL ? (
                      <img
                        src={patient.photoURL}
                        alt={patient.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">
                        {patient.name.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{patient.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-sky-700">{stats.percentage}%</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Adherence</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State: No linked patients */
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Linked Patients Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Connect to a patient by typing their registered email address (e.g.{' '}
            <code className="text-teal-700 font-bold">bhavanasreekalisetty1308@gmail.com</code> or{' '}
            <code className="text-teal-700 font-bold">meghana.r@example.com</code>).
          </p>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-2xl transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Link Your First Patient</span>
          </button>
        </div>
      )}

      {/* Selected Patient Read-Only Dashboard */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Read-Only Safety Banner */}
          <div className="bg-gradient-to-r from-sky-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedPatient.photoURL ? (
                <img
                  src={selectedPatient.photoURL}
                  alt={selectedPatient.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-xl">
                  {selectedPatient.name.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-sky-200">
                    Patient Profile
                  </span>
                  <span className="text-[11px] font-semibold text-sky-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-sky-300" />
                    Read-Only Protected
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  {selectedPatient.name}
                </h2>
                <p className="text-xs text-sky-200">{selectedPatient.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSendNudge}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Bell className="w-4 h-4 text-sky-600" />
                <span>{nudgeSent ? 'Nudge Alert Sent!' : 'Send Dose Nudge'}</span>
              </button>

              <button
                onClick={() => handleUnlink(selectedPatient.email)}
                className="text-xs text-slate-300 hover:text-rose-300 px-3 py-2"
                title="Unlink this patient from your supervision"
              >
                Unlink
              </button>
            </div>
          </div>

          {/* Patient Adherence & Alert Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                7-Day Adherence
              </span>
              <div className="mt-2 text-3xl font-black text-sky-700">
                {patientStats ? `${patientStats.percentage}%` : '100%'}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {patientStats?.taken || 0} taken of {patientStats?.totalScheduled || 0} scheduled
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Prescriptions
              </span>
              <div className="mt-2 text-3xl font-black text-slate-900">
                {patientMedicines.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Active medicines logged</div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                lowStockAlerts.length > 0
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Low Stock Alerts
              </span>
              <div
                className={`mt-2 text-3xl font-black ${
                  lowStockAlerts.length > 0 ? 'text-amber-800' : 'text-slate-900'
                }`}
              >
                {lowStockAlerts.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {lowStockAlerts.length > 0 ? 'Requires refill soon' : 'Stock levels healthy'}
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                expiredAlerts.length > 0
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Expiry Alerts
              </span>
              <div
                className={`mt-2 text-3xl font-black ${
                  expiredAlerts.length > 0 ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {expiredAlerts.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {expiredAlerts.length > 0 ? 'Expired items present' : 'All medicines valid'}
              </div>
            </div>
          </div>

          {/* Today's Schedule for the Patient */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <span>Today's Medicine Schedule for {selectedPatient.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live status of doses taken, upcoming, or missed today.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                {patientSchedule.length} doses scheduled
              </span>
            </div>

            {patientSchedule.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">
                No doses scheduled for {selectedPatient.name} today.
              </p>
            ) : (
              <div className="space-y-3">
                {patientSchedule.map((item) => {
                  const isTaken = item.status === 'taken';
                  const isDue = item.status === 'due';
                  const isSkipped = item.status === 'skipped';
                  const isMissed = item.status === 'missed';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        isTaken
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isDue
                          ? 'bg-amber-50 border-amber-300'
                          : isSkipped
                          ? 'bg-slate-50 border-slate-200'
                          : isMissed
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isTaken
                              ? 'bg-emerald-500 text-white'
                              : isDue
                              ? 'bg-amber-500 text-white'
                              : isSkipped
                              ? 'bg-slate-300 text-slate-600'
                              : isMissed
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Pill className="w-5 h-5 -rotate-45" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.medicine.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{item.medicine.dosage}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              {formatTime12h(item.time)}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{item.medicine.instructions}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDue
                              ? 'bg-amber-100 text-amber-800'
                              : isSkipped
                              ? 'bg-slate-200 text-slate-700'
                              : isMissed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Patient's Prescriptions List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              Prescription Inventory ({patientMedicines.length})
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {patientMedicines.map((med) => (
                <div
                  key={med.medicineId}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase text-slate-400">{med.form}</span>
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{med.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {med.frequency} • {med.times.map((t) => formatTime12h(t)).join(', ')}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Remaining Stock: <strong className="text-slate-800">{med.stock}</strong>
                    </span>
                    <span className="text-slate-400 font-mono">Exp: {med.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Link Patient Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Link a Patient</h3>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter the registered email of the patient you wish to monitor. They will be added to your supervised patients list with read-only data synchronization.
            </p>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={linkEmailInput}
                    onChange={(e) => setLinkEmailInput(e.target.value)}
                    placeholder="e.g. bhavanasreekalisetty1308@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="text-xs text-slate-500">
                <span className="font-semibold block mb-1">Available demo patients:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLinkEmailInput('bhavanasreekalisetty1308@gmail.com')}
                    className="bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 px-2 py-1 rounded-md text-[11px] font-medium"
                  >
                    bhavanasreekalisetty1308@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkEmailInput('meghana.r@example.com')}
                    className="bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 px-2 py-1 rounded-md text-[11px] font-medium"
                  >
                    meghana.r@example.com
                  </button>
                </div>
              </div>

              {linkError && <p className="text-xs text-rose-500 font-medium">{linkError}</p>}
              {linkSuccess && <p className="text-xs text-emerald-600 font-bold">{linkSuccess}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Link Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

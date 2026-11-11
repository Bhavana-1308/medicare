import { UserProfile, Medicine, DoseLog, TodayDoseItem, AdherenceStats, DoseStatus } from '../types';

const STORAGE_USERS = 'medicare_users_v2';
const STORAGE_CURRENT_USER = 'medicare_current_user_v2';
const STORAGE_MEDICINES = 'medicare_medicines_v2';
const STORAGE_DOSE_LOGS = 'medicare_dose_logs_v2';

export const EVENT_DATA_CHANGED = 'medicare_data_changed';

function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_DATA_CHANGED));
  }
}

// Helpers for formatted dates
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// Seed initial demo data
function initializeSeedData() {
  if (typeof window === 'undefined') return;

  const existingUsers = localStorage.getItem(STORAGE_USERS);
  if (!existingUsers) {
    const seedUsers: UserProfile[] = [
      {
        uid: 'user-bhavana-01',
        name: 'K. Bhavana Sree',
        email: 'bhavanasreekalisetty1308@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'patient',
        linkedPatients: [],
        linkedCaregivers: ['srinivas.faculty@geethanjali.edu.in'],
        createdAt: new Date().toISOString(),
        notificationSettings: {
          sound: true,
          browser: true,
          inApp: true,
        },
      },
      {
        uid: 'user-meghana-02',
        name: 'R. Meghana',
        email: 'meghana.r@example.com',
        photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        role: 'patient',
        linkedPatients: [],
        linkedCaregivers: ['srinivas.faculty@geethanjali.edu.in'],
        createdAt: new Date().toISOString(),
        notificationSettings: {
          sound: true,
          browser: true,
          inApp: true,
        },
      },
      {
        uid: 'user-srinivas-cg',
        name: 'Prof. O. Srinivas',
        email: 'srinivas.faculty@geethanjali.edu.in',
        photoURL: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        role: 'caregiver',
        linkedPatients: ['bhavanasreekalisetty1308@gmail.com', 'meghana.r@example.com'],
        linkedCaregivers: [],
        createdAt: new Date().toISOString(),
        notificationSettings: {
          sound: true,
          browser: true,
          inApp: true,
        },
      },
    ];

    localStorage.setItem(STORAGE_USERS, JSON.stringify(seedUsers));
  }

  const existingMeds = localStorage.getItem(STORAGE_MEDICINES);
  if (!existingMeds) {
    const today = new Date();
    const plus30Days = new Date(today);
    plus30Days.setDate(today.getDate() + 20); // Expiring soon (<30 days)

    const plus6Months = new Date(today);
    plus6Months.setMonth(today.getMonth() + 6);

    const plus1Year = new Date(today);
    plus1Year.setFullYear(today.getFullYear() + 1);

    const minus5Days = new Date(today);
    minus5Days.setDate(today.getDate() - 5); // Expired

    const seedMedicines: Medicine[] = [
      {
        medicineId: 'med-1',
        userId: 'user-bhavana-01',
        name: 'Metformin Hydrochloride',
        dosage: '500 mg',
        frequency: 'Twice daily',
        times: ['08:30', '20:30'],
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        stock: 28,
        lowStockLimit: 10,
        expiryDate: plus1Year.toISOString().split('T')[0],
        notes: 'Take with or immediately after meals to reduce stomach upset.',
        form: 'tablet',
        instructions: 'After food',
        color: 'teal',
        createdAt: new Date().toISOString(),
      },
      {
        medicineId: 'med-2',
        userId: 'user-bhavana-01',
        name: 'Paracetamol Dolo',
        dosage: '650 mg',
        frequency: 'Once daily',
        times: ['14:00'],
        startDate: '2026-02-01',
        endDate: '2026-06-30',
        stock: 5, // LOW STOCK ALERT (< 8)
        lowStockLimit: 8,
        expiryDate: plus6Months.toISOString().split('T')[0],
        notes: 'For mild fever or backache. Drink plenty of water.',
        form: 'tablet',
        instructions: 'After food',
        color: 'rose',
        createdAt: new Date().toISOString(),
      },
      {
        medicineId: 'med-3',
        userId: 'user-bhavana-01',
        name: 'Vitamin D3 Calci-Quick',
        dosage: '60,000 IU',
        frequency: 'Once daily',
        times: ['09:00'],
        startDate: '2026-02-15',
        endDate: '2026-08-15',
        stock: 14,
        lowStockLimit: 5,
        expiryDate: plus30Days.toISOString().split('T')[0], // EXPIRING SOON
        notes: 'Take in morning with breakfast containing healthy fats.',
        form: 'capsule',
        instructions: 'With food',
        color: 'amber',
        createdAt: new Date().toISOString(),
      },
      {
        medicineId: 'med-4',
        userId: 'user-bhavana-01',
        name: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Once daily',
        times: ['21:30'],
        startDate: '2026-01-10',
        endDate: '2026-12-31',
        stock: 35,
        lowStockLimit: 10,
        expiryDate: plus6Months.toISOString().split('T')[0],
        notes: 'Take before bedtime regularly.',
        form: 'tablet',
        instructions: 'Before sleep',
        color: 'blue',
        createdAt: new Date().toISOString(),
      },
      {
        medicineId: 'med-5',
        userId: 'user-bhavana-01',
        name: 'Gentamicin Eye Drops',
        dosage: '2 drops',
        frequency: 'Twice daily',
        times: ['08:00', '19:00'],
        startDate: '2025-10-01',
        endDate: '2026-03-01',
        stock: 2,
        lowStockLimit: 1,
        expiryDate: minus5Days.toISOString().split('T')[0], // EXPIRED ALERT
        notes: 'Discard 30 days after opening. Wash hands before application.',
        form: 'drops',
        instructions: 'Anytime',
        color: 'purple',
        createdAt: new Date().toISOString(),
      },
      // Meghana's medicine
      {
        medicineId: 'med-m-1',
        userId: 'user-meghana-02',
        name: 'Thyroxine Sodium',
        dosage: '50 mcg',
        frequency: 'Once daily',
        times: ['07:00'],
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        stock: 45,
        lowStockLimit: 15,
        expiryDate: plus1Year.toISOString().split('T')[0],
        notes: 'Take on empty stomach with plain water. Wait 30 mins before tea.',
        form: 'tablet',
        instructions: 'Empty stomach',
        color: 'teal',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_MEDICINES, JSON.stringify(seedMedicines));
  }

  const existingLogs = localStorage.getItem(STORAGE_DOSE_LOGS);
  if (!existingLogs) {
    const todayStr = getTodayString();
    const seedLogs: DoseLog[] = [
      // Morning dose already taken today
      {
        id: `log-med-1-${todayStr}-08:30`,
        medicineId: 'med-1',
        medicineName: 'Metformin Hydrochloride',
        dosage: '500 mg',
        userId: 'user-bhavana-01',
        date: todayStr,
        time: '08:30',
        status: 'taken',
        loggedAt: `${todayStr}T08:32:00.000Z`,
        stockDeducted: true,
      },
      {
        id: `log-med-3-${todayStr}-09:00`,
        medicineId: 'med-3',
        medicineName: 'Vitamin D3 Calci-Quick',
        dosage: '60,000 IU',
        userId: 'user-bhavana-01',
        date: todayStr,
        time: '09:00',
        status: 'taken',
        loggedAt: `${todayStr}T09:05:00.000Z`,
        stockDeducted: true,
      },
    ];

    // Seed previous 6 days for rich adherence history
    const d = new Date();
    for (let i = 1; i <= 6; i++) {
      const pastDate = new Date(d);
      pastDate.setDate(d.getDate() - i);
      const pastStr = pastDate.toISOString().split('T')[0];

      seedLogs.push({
        id: `log-med-1-${pastStr}-08:30`,
        medicineId: 'med-1',
        medicineName: 'Metformin Hydrochloride',
        dosage: '500 mg',
        userId: 'user-bhavana-01',
        date: pastStr,
        time: '08:30',
        status: 'taken',
        loggedAt: `${pastStr}T08:35:00.000Z`,
        stockDeducted: true,
      });

      seedLogs.push({
        id: `log-med-1-${pastStr}-20:30`,
        medicineId: 'med-1',
        medicineName: 'Metformin Hydrochloride',
        dosage: '500 mg',
        userId: 'user-bhavana-01',
        date: pastStr,
        time: '20:30',
        status: i === 3 ? 'skipped' : 'taken',
        loggedAt: `${pastStr}T20:30:00.000Z`,
        stockDeducted: i !== 3,
        notes: i === 3 ? 'Skipped due to fasting' : undefined,
      });

      seedLogs.push({
        id: `log-med-4-${pastStr}-21:30`,
        medicineId: 'med-4',
        medicineName: 'Atorvastatin',
        dosage: '10 mg',
        userId: 'user-bhavana-01',
        date: pastStr,
        time: '21:30',
        status: i === 5 ? 'missed' : 'taken',
        loggedAt: `${pastStr}T21:40:00.000Z`,
        stockDeducted: i !== 5,
      });
    }

    localStorage.setItem(STORAGE_DOSE_LOGS, JSON.stringify(seedLogs));
  }
}

// Auto initialize on module load
initializeSeedData();

// Storage Service API
export const StorageService = {
  // Current user / Session
  getCurrentUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) {
      // Default to Bhavana Sree for instant demonstration if not set
      const users = this.getAllUsers();
      const defaultUser = users.find((u) => u.email === 'bhavanasreekalisetty1308@gmail.com') || users[0] || null;
      if (defaultUser) {
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(defaultUser));
        return defaultUser;
      }
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
      // update in users collection too
      this.saveUser(user);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
    notifyDataChanged();
  },

  getAllUsers(): UserProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
    } catch {
      return [];
    }
  },

  getUserByEmail(email: string): UserProfile | null {
    const users = this.getAllUsers();
    return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  },

  getUserById(uid: string): UserProfile | null {
    const users = this.getAllUsers();
    return users.find((u) => u.uid === uid) || null;
  },

  saveUser(user: UserProfile) {
    const users = this.getAllUsers();
    const idx = users.findIndex((u) => u.uid === user.uid || u.email === user.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.uid === user.uid) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify({ ...current, ...user }));
    }
    notifyDataChanged();
  },

  // Medicines Collection
  getMedicines(userId?: string): Medicine[] {
    if (typeof window === 'undefined') return [];
    try {
      const all: Medicine[] = JSON.parse(localStorage.getItem(STORAGE_MEDICINES) || '[]');
      if (userId) {
        return all.filter((m) => m.userId === userId);
      }
      return all;
    } catch {
      return [];
    }
  },

  getMedicineById(medicineId: string): Medicine | null {
    const all = this.getMedicines();
    return all.find((m) => m.medicineId === medicineId) || null;
  },

  addMedicine(medicineData: Omit<Medicine, 'medicineId' | 'createdAt'>): Medicine {
    const all = this.getMedicines();
    const newMed: Medicine = {
      ...medicineData,
      medicineId: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newMed);
    localStorage.setItem(STORAGE_MEDICINES, JSON.stringify(all));
    notifyDataChanged();
    return newMed;
  },

  updateMedicine(medicineId: string, updates: Partial<Medicine>): Medicine | null {
    const all = this.getMedicines();
    const idx = all.findIndex((m) => m.medicineId === medicineId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    localStorage.setItem(STORAGE_MEDICINES, JSON.stringify(all));
    notifyDataChanged();
    return all[idx];
  },

  deleteMedicine(medicineId: string): boolean {
    const all = this.getMedicines();
    const filtered = all.filter((m) => m.medicineId !== medicineId);
    if (filtered.length !== all.length) {
      localStorage.setItem(STORAGE_MEDICINES, JSON.stringify(filtered));
      notifyDataChanged();
      return true;
    }
    return false;
  },

  refillStock(medicineId: string, addedQuantity: number) {
    const med = this.getMedicineById(medicineId);
    if (med) {
      const newStock = Math.max(0, (med.stock || 0) + addedQuantity);
      this.updateMedicine(medicineId, { stock: newStock });
    }
  },

  // Dose Logs Collection
  getDoseLogs(userId?: string): DoseLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const all: DoseLog[] = JSON.parse(localStorage.getItem(STORAGE_DOSE_LOGS) || '[]');
      if (userId) {
        return all.filter((l) => l.userId === userId);
      }
      return all;
    } catch {
      return [];
    }
  },

  /**
   * Records or updates a dose status.
   * Decreases stock when marked as taken if not already deducted.
   * Restores stock if un-marking from taken.
   */
  recordDoseStatus(
    medicine: Medicine,
    date: string,
    time: string,
    newStatus: DoseStatus,
    notes?: string
  ): DoseLog {
    const logs = this.getDoseLogs();
    const logId = `log-${medicine.medicineId}-${date}-${time}`;
    const existingIdx = logs.findIndex((l) => l.id === logId);

    let stockDeducted = false;
    let existingLog: DoseLog | null = null;

    if (existingIdx >= 0) {
      existingLog = logs[existingIdx];
      stockDeducted = existingLog.stockDeducted || false;
    }

    // Handle stock changes
    const currentMed = this.getMedicineById(medicine.medicineId) || medicine;

    if (newStatus === 'taken' && !stockDeducted) {
      // Deduct 1 unit from stock safely
      const newStock = Math.max(0, currentMed.stock - 1);
      this.updateMedicine(currentMed.medicineId, { stock: newStock });
      stockDeducted = true;
    } else if (newStatus !== 'taken' && stockDeducted) {
      // Restore 1 unit if previously deducted
      const newStock = currentMed.stock + 1;
      this.updateMedicine(currentMed.medicineId, { stock: newStock });
      stockDeducted = false;
    }

    const updatedLog: DoseLog = {
      id: logId,
      medicineId: currentMed.medicineId,
      medicineName: currentMed.name,
      dosage: currentMed.dosage,
      userId: currentMed.userId,
      date,
      time,
      status: newStatus,
      loggedAt: new Date().toISOString(),
      stockDeducted,
      notes: notes || existingLog?.notes,
    };

    if (existingIdx >= 0) {
      logs[existingIdx] = updatedLog;
    } else {
      logs.push(updatedLog);
    }

    localStorage.setItem(STORAGE_DOSE_LOGS, JSON.stringify(logs));
    notifyDataChanged();
    return updatedLog;
  },

  /**
   * Builds today's schedule for a user by merging medicine schedules with dose logs
   */
  getTodaySchedule(userId: string): TodayDoseItem[] {
    const todayStr = getTodayString();
    const medicines = this.getMedicines(userId);
    const logs = this.getDoseLogs(userId);

    const scheduleItems: TodayDoseItem[] = [];

    // Current hour & minute for determining 'due' or 'missed'
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    medicines.forEach((med) => {
      // Check date bounds
      if (med.startDate && todayStr < med.startDate) return;
      if (med.endDate && todayStr > med.endDate) return;

      med.times.forEach((t) => {
        const id = `sched-${med.medicineId}-${todayStr}-${t}`;
        const logId = `log-${med.medicineId}-${todayStr}-${t}`;
        const existingLog = logs.find((l) => l.id === logId || (l.medicineId === med.medicineId && l.date === todayStr && l.time === t));

        let computedStatus: DoseStatus = 'upcoming';

        if (existingLog) {
          computedStatus = existingLog.status;
        } else {
          const [hStr, mStr] = t.split(':');
          const doseMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr || '0', 10);
          const diffMinutes = currentMinutes - doseMinutes;

          if (diffMinutes > 120) {
            // More than 2 hours past dose time without action
            computedStatus = 'missed';
          } else if (diffMinutes >= -15 && diffMinutes <= 120) {
            // Within 15 mins before to 2 hrs after
            computedStatus = 'due';
          } else {
            computedStatus = 'upcoming';
          }
        }

        scheduleItems.push({
          id,
          medicineId: med.medicineId,
          medicine: med,
          time: t,
          date: todayStr,
          status: computedStatus,
          log: existingLog,
        });
      });
    });

    // Sort by scheduled time
    scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
    return scheduleItems;
  },

  /**
   * Calculates adherence statistics for a user
   */
  getAdherenceStats(userId: string, days = 7): AdherenceStats {
    const logs = this.getDoseLogs(userId);
    const todaySchedule = this.getTodaySchedule(userId);

    // Filter logs for the selected timeframe
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const pastLogs = logs.filter((l) => l.date >= cutoffStr && l.date <= getTodayString());

    const taken = pastLogs.filter((l) => l.status === 'taken').length;
    const skipped = pastLogs.filter((l) => l.status === 'skipped').length;
    const missed = pastLogs.filter((l) => l.status === 'missed').length;

    // Count today's upcoming
    const upcoming = todaySchedule.filter((s) => s.status === 'upcoming' || s.status === 'due').length;

    const totalEvaluated = taken + skipped + missed;
    const percentage = totalEvaluated > 0 ? Math.round((taken / totalEvaluated) * 100) : 100;

    // Calculate streak of consecutive days where all scheduled doses were taken
    let streakDays = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() - i);
      const checkStr = checkDate.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.date === checkStr);
      if (dayLogs.length === 0 && i > 0) break;
      const dayMissed = dayLogs.filter((l) => l.status === 'missed').length;
      if (dayMissed === 0 && dayLogs.some((l) => l.status === 'taken')) {
        streakDays++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalScheduled: totalEvaluated + upcoming,
      taken,
      skipped,
      missed,
      upcoming,
      percentage,
      streakDays: Math.max(1, streakDays),
    };
  },

  // Caregiver Patient Linking
  linkPatient(caregiverEmail: string, patientEmail: string): { success: boolean; message: string } {
    const caregiver = this.getUserByEmail(caregiverEmail);
    const patient = this.getUserByEmail(patientEmail);

    if (!caregiver) {
      return { success: false, message: 'Caregiver account not found.' };
    }
    if (!patient) {
      return { success: false, message: `No user found with email "${patientEmail}". Make sure the patient has registered first.` };
    }
    if (patient.role !== 'patient') {
      return { success: false, message: `The user with email "${patientEmail}" is registered as a Caregiver, not a Patient.` };
    }

    // Add to caregiver's linkedPatients
    const updatedCaregiverPatients = Array.from(new Set([...(caregiver.linkedPatients || []), patient.email]));
    this.saveUser({ ...caregiver, linkedPatients: updatedCaregiverPatients });

    // Add to patient's linkedCaregivers
    const updatedPatientCaregivers = Array.from(new Set([...(patient.linkedCaregivers || []), caregiver.email]));
    this.saveUser({ ...patient, linkedCaregivers: updatedPatientCaregivers });

    notifyDataChanged();
    return { success: true, message: `Successfully linked ${patient.name} (${patient.email})!` };
  },

  unlinkPatient(caregiverEmail: string, patientEmail: string) {
    const caregiver = this.getUserByEmail(caregiverEmail);
    const patient = this.getUserByEmail(patientEmail);

    if (caregiver) {
      const updated = (caregiver.linkedPatients || []).filter((e) => e !== patientEmail);
      this.saveUser({ ...caregiver, linkedPatients: updated });
    }
    if (patient) {
      const updated = (patient.linkedCaregivers || []).filter((e) => e !== caregiverEmail);
      this.saveUser({ ...patient, linkedCaregivers: updated });
    }
    notifyDataChanged();
  },

  // Reset to default seed
  resetAllData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_USERS);
    localStorage.removeItem(STORAGE_CURRENT_USER);
    localStorage.removeItem(STORAGE_MEDICINES);
    localStorage.removeItem(STORAGE_DOSE_LOGS);
    initializeSeedData();
    notifyDataChanged();
  },
};

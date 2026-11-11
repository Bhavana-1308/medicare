export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'patient' | 'caregiver';
  linkedPatients: string[]; // emails or uids
  linkedCaregivers: string[]; // emails or uids
  createdAt: string;
  notificationSettings: {
    sound: boolean;
    browser: boolean;
    inApp: boolean;
  };
}

export type MedicineFrequency =
  | 'Once daily'
  | 'Twice daily'
  | 'Three times daily'
  | 'Four times daily'
  | 'Custom'
  | 'As needed';

export type MedicineForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'drops'
  | 'inhaler'
  | 'cream'
  | 'other';

export type FoodInstruction =
  | 'Before food'
  | 'After food'
  | 'With food'
  | 'Empty stomach'
  | 'Before sleep'
  | 'Anytime';

export interface Medicine {
  medicineId: string;
  userId: string; // Patient UID
  name: string;
  dosage: string; // e.g. "1 Tablet", "500 mg", "5 ml"
  frequency: MedicineFrequency;
  times: string[]; // HH:mm 24-hr format e.g. ["08:00", "20:00"]
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  stock: number;
  lowStockLimit: number;
  expiryDate: string; // YYYY-MM-DD
  notes?: string;
  form: MedicineForm;
  instructions: FoodInstruction;
  color?: string; // Tailwind color accent
  createdAt: string;
}

export type DoseStatus = 'upcoming' | 'due' | 'taken' | 'skipped' | 'missed';

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: DoseStatus;
  loggedAt: string; // ISO string
  stockDeducted: boolean;
  notes?: string;
}

export interface TodayDoseItem {
  id: string; // generated dose key for today (medicineId + date + time)
  medicineId: string;
  medicine: Medicine;
  time: string;
  date: string;
  status: DoseStatus;
  log?: DoseLog;
}

export interface AdherenceStats {
  totalScheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  upcoming: number;
  percentage: number;
  streakDays: number;
}

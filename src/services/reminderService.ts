import { Medicine, DoseStatus } from '../types';
import { StorageService, getTodayString, formatTime12h } from './storage';
import { soundService } from './sound';

export interface ActiveReminder {
  id: string; // unique reminder key
  medicineId: string;
  medicine: Medicine;
  time: string;
  date: string;
  dosage: string;
  instructions: string;
  triggeredAt: number;
}

type ReminderListener = (activeReminders: ActiveReminder[]) => void;

class ReminderService {
  private intervalId: number | null = null;
  private notifiedKeys = new Set<string>();
  private activeReminders: ActiveReminder[] = [];
  private listeners: Set<ReminderListener> = new Set();
  private isChecking = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Start checking every 15 seconds
    this.intervalId = window.setInterval(() => {
      this.checkScheduledReminders();
    }, 15000);

    // Initial check after 1.5s
    window.setTimeout(() => {
      this.checkScheduledReminders();
    }, 1500);
  }

  public subscribe(listener: ReminderListener): () => void {
    this.listeners.add(listener);
    listener(this.activeReminders);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.activeReminders]));
  }

  /**
   * Request browser notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public getNotificationPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Checks current schedule against current time and triggers alerts
   */
  public checkScheduledReminders() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const currentUser = StorageService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'patient') {
        this.isChecking = false;
        return;
      }

      const todayStr = getTodayString();
      const todaySchedule = StorageService.getTodaySchedule(currentUser.uid);

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentMinutes = currentH * 60 + currentM;

      for (const item of todaySchedule) {
        // If already taken or skipped, don't notify
        if (item.status === 'taken' || item.status === 'skipped') {
          // Remove from active in-app reminders if present
          this.dismissReminder(item.medicineId, item.date, item.time);
          continue;
        }

        const [hStr, mStr] = item.time.split(':');
        const doseH = parseInt(hStr, 10);
        const doseM = parseInt(mStr || '0', 10);
        const doseMinutes = doseH * 60 + doseM;

        // Trigger window: between 0 and 60 minutes after scheduled time
        const diff = currentMinutes - doseMinutes;
        const reminderKey = `reminder-${item.medicineId}-${todayStr}-${item.time}`;

        if (diff >= 0 && diff <= 60 && !this.notifiedKeys.has(reminderKey)) {
          this.notifiedKeys.add(reminderKey);
          this.triggerReminderAlert(item.medicine, todayStr, item.time);
        }
      }
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Trigger in-app popup and native system browser notification
   */
  public triggerReminderAlert(medicine: Medicine, date: string, time: string, isManualTest = false) {
    const reminderId = `alert-${medicine.medicineId}-${date}-${time}-${Date.now()}`;
    const formattedTime = formatTime12h(time);

    const reminder: ActiveReminder = {
      id: reminderId,
      medicineId: medicine.medicineId,
      medicine,
      time,
      date,
      dosage: medicine.dosage,
      instructions: medicine.instructions || 'Follow prescribed directions',
      triggeredAt: Date.now(),
    };

    // Add to in-app active reminders list (prevent duplicate of same med/time)
    const exists = this.activeReminders.some(
      (r) => r.medicineId === medicine.medicineId && r.time === time && r.date === date
    );
    if (!exists) {
      this.activeReminders.unshift(reminder);
      this.notifyListeners();
    }

    // Play synthesized medical chime
    soundService.playReminderChime();

    // Trigger Native Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = isManualTest
          ? `[Test Alert] MediCare Reminder: ${medicine.name}`
          : `MediCare Reminder: Time for ${medicine.name}`;
        const options: NotificationOptions = {
          body: `Dose: ${medicine.dosage} (${formattedTime})\nInstruction: ${medicine.instructions}\nClick to view and mark as taken.`,
          icon: '/favicon.ico',
          tag: reminderId,
          requireInteraction: true,
        };

        const notification = new Notification(title, options);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  }

  /**
   * Triggers an immediate test reminder for verification & PBL demo
   */
  public triggerTestReminder(medicineName = 'Metformin Hydrochloride', dosage = '500 mg') {
    const currentUser = StorageService.getCurrentUser();
    const todayStr = getTodayString();
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const testMedicine: Medicine = {
      medicineId: `test-med-${Date.now()}`,
      userId: currentUser?.uid || 'user-demo',
      name: medicineName,
      dosage: dosage,
      frequency: 'Twice daily',
      times: [currentTimeStr],
      startDate: todayStr,
      endDate: todayStr,
      stock: 15,
      lowStockLimit: 5,
      expiryDate: '2026-12-31',
      form: 'tablet',
      instructions: 'After food',
      createdAt: new Date().toISOString(),
    };

    this.triggerReminderAlert(testMedicine, todayStr, currentTimeStr, true);
  }

  public dismissReminder(medicineId: string, date: string, time: string) {
    this.activeReminders = this.activeReminders.filter(
      (r) => !(r.medicineId === medicineId && r.date === date && r.time === time)
    );
    this.notifyListeners();
  }

  public markDoseFromReminder(reminder: ActiveReminder, status: DoseStatus) {
    StorageService.recordDoseStatus(reminder.medicine, reminder.date, reminder.time, status);
    if (status === 'taken') {
      soundService.playSuccessChime();
    }
    this.dismissReminder(reminder.medicineId, reminder.date, reminder.time);
  }

  public cleanup() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }
}

export const reminderService = new ReminderService();

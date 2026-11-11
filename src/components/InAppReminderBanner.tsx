import React, { useEffect, useState } from 'react';
import { reminderService, ActiveReminder } from '../services/reminderService';
import { Bell, CheckCircle2, XCircle, Clock, Pill, Volume2 } from 'lucide-react';
import { soundService } from '../services/sound';
import { formatTime12h } from '../services/storage';

export const InAppReminderBanner: React.FC = () => {
  const [reminders, setReminders] = useState<ActiveReminder[]>([]);

  useEffect(() => {
    const unsubscribe = reminderService.subscribe((active) => {
      setReminders(active);
    });
    return () => unsubscribe();
  }, []);

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-white rounded-2xl p-4 shadow-xl border-2 border-teal-500/80 animate-bounce-once transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <Bell className="w-5 h-5 animate-pulse text-teal-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                    Dose Due Now
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatTime12h(reminder.time)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mt-0.5 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  {reminder.medicine.name}
                </h4>
              </div>
            </div>

            <button
              onClick={() => soundService.playReminderChime()}
              title="Play alert chime again"
              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-slate-400 font-medium">Dosage: </span>
              <strong className="text-slate-700">{reminder.dosage}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Instruction: </span>
              <strong className="text-teal-700">{reminder.instructions}</strong>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => reminderService.markDoseFromReminder(reminder, 'taken')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded-xl text-sm transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Taken
            </button>
            <button
              onClick={() => reminderService.markDoseFromReminder(reminder, 'skipped')}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl text-sm transition"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              Skip
            </button>
            <button
              onClick={() => reminderService.dismissReminder(reminder.medicineId, reminder.date, reminder.time)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

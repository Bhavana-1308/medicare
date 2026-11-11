import React from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { User, HeartHandshake, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface RoleSelectModalProps {
  user: UserProfile;
  isOpen: boolean;
  onRoleSelected: (role: 'patient' | 'caregiver') => void;
  onClose?: () => void;
}

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  user,
  isOpen,
  onRoleSelected,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSelect = (role: 'patient' | 'caregiver') => {
    StorageService.saveUser({
      ...user,
      role,
    });
    onRoleSelected(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to MediCare</h2>
          <p className="text-slate-600 text-sm mt-1">
            Hello, <span className="font-semibold text-slate-800">{user.name}</span>. Please choose how you plan to use MediCare:
          </p>
        </div>

        <div className="space-y-4">
          {/* Patient Card */}
          <button
            onClick={() => handleSelect('patient')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 hover:shadow-md ${
              user.role === 'patient'
                ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                : 'border-slate-200 hover:border-teal-400 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">I am a Patient</h3>
                {user.role === 'patient' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Manage your daily prescriptions, receive timely dose reminders, track pill inventory, and monitor adherence statistics.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-teal-700">
                <span>Access Patient Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Caregiver Card */}
          <button
            onClick={() => handleSelect('caregiver')}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 hover:shadow-md ${
              user.role === 'caregiver'
                ? 'border-sky-600 bg-sky-50/50 ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:border-sky-400 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">I am a Caregiver / Doctor</h3>
                {user.role === 'caregiver' && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Remotely monitor linked patients or family members, oversee taken & missed doses, receive stock alerts, and inspect compliance.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-sky-700">
                <span>Access Caregiver Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {onClose && (
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Cancel and stay on current role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

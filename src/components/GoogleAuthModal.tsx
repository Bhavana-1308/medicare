import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { X, UserPlus, Check, ArrowRight } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<'patient' | 'caregiver'>('patient');

  if (!isOpen) return null;

  const users = StorageService.getAllUsers();

  const handleSelectAccount = (user: UserProfile) => {
    StorageService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      alert('Please provide name and email.');
      return;
    }

    let user = StorageService.getUserByEmail(customEmail.trim());
    if (!user) {
      user = {
        uid: `user-${Date.now()}`,
        name: customName.trim(),
        email: customEmail.trim(),
        role: customRole,
        linkedPatients: [],
        linkedCaregivers: [],
        createdAt: new Date().toISOString(),
        notificationSettings: {
          sound: true,
          browser: true,
          inApp: true,
        },
      };
      StorageService.saveUser(user);
    } else {
      user = {
        ...user,
        name: customName.trim(),
        role: customRole,
      };
      StorageService.saveUser(user);
    }

    StorageService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        {/* Google Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Sign in with Google</h3>
              <p className="text-xs text-slate-500">to continue to MediCare</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCustomMode ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select an account to sign in or test different roles:
            </p>

            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.uid}
                  onClick={() => handleSelectAccount(u)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">{u.email}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      u.role === 'patient'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-teal-400 text-slate-600 hover:text-teal-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign in with another Google account</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. john.doe@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomRole('patient')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    customRole === 'patient'
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRole('caregiver')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    customRole === 'caregiver'
                      ? 'border-sky-600 bg-sky-50 text-sky-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Caregiver
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Back to preloaded accounts
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Continue to MediCare
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

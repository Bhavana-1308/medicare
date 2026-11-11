import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { reminderService } from '../services/reminderService';
import { soundService } from '../services/sound';
import {
  User,
  Mail,
  Shield,
  Bell,
  Volume2,
  RefreshCw,
  LogOut,
  X,
  Check,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onOpenRoleModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSignOut,
  onOpenRoleModal,
}) => {
  const [name, setName] = useState(user.name);
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [soundEnabled, setSoundEnabled] = useState(user.notificationSettings?.sound ?? true);
  const [browserEnabled, setBrowserEnabled] = useState(user.notificationSettings?.browser ?? true);
  const [inAppEnabled, setInAppEnabled] = useState(user.notificationSettings?.inApp ?? true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      photoURL: photoURL.trim(),
      notificationSettings: {
        sound: soundEnabled,
        browser: browserEnabled,
        inApp: inAppEnabled,
      },
    };
    StorageService.saveUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestAudio = () => {
    soundService.playReminderChime();
  };

  const handleResetData = () => {
    if (confirm('Reset demo medicines, dose logs, and inventory back to factory state?')) {
      StorageService.resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">User Profile & Settings</h2>
              <p className="text-xs text-slate-400">Account identity and alert preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar and Info Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {photoURL ? (
              <img
                src={photoURL}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    user.role === 'patient'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  Role: {user.role}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRoleModal();
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline"
                >
                  Switch Role
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Avatar Photo URL
              </label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-teal-600" />
                Notification Preferences
              </span>
              <button
                type="button"
                onClick={handleTestAudio}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chime</span>
              </button>
            </div>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <div>
                <p className="text-sm font-semibold text-slate-800">Sound Chimes</p>
                <p className="text-xs text-slate-400">Play pleasant audio chime when doses are due</p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-200/60 pt-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Browser System Notifications</p>
                <p className="text-xs text-slate-400">Show desktop alert when tab is in background</p>
              </div>
              <input
                type="checkbox"
                checked={browserEnabled}
                onChange={(e) => setBrowserEnabled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-200/60 pt-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">In-App Alert Toasts</p>
                <p className="text-xs text-slate-400">Display interactive banners at bottom of screen</p>
              </div>
              <input
                type="checkbox"
                checked={inAppEnabled}
                onChange={(e) => setInAppEnabled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Prescriptions</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

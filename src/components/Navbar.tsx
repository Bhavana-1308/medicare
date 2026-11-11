import React, { useState } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { reminderService } from '../services/reminderService';
import {
  Pill,
  Bell,
  BellRing,
  User,
  HeartHandshake,
  LogOut,
  Sparkles,
  GraduationCap,
  Volume2,
  Check,
  ChevronDown,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenPBLInfo: () => void;
  onOpenRoleModal: () => void;
  onOpenProfile: () => void;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onTabChange,
  onOpenPBLInfo,
  onOpenRoleModal,
  onOpenProfile,
  onLoginClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    reminderService.getNotificationPermission()
  );

  const handleRequestNotifications = async () => {
    const result = await reminderService.requestNotificationPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      reminderService.triggerTestReminder();
    }
  };

  const handleSwitchUser = (email: string) => {
    const targetUser = StorageService.getUserByEmail(email);
    if (targetUser) {
      StorageService.setCurrentUser(targetUser);
      setUserDropdownOpen(false);
    }
  };

  const handleSignOut = () => {
    StorageService.setCurrentUser(null);
    setUserDropdownOpen(false);
    onTabChange('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange(currentUser ? (currentUser.role === 'caregiver' ? 'caregiver' : 'dashboard') : 'landing')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-teal-800 to-sky-700 bg-clip-text text-transparent">
                  MediCare
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                  PBL Edition
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          {currentUser ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              {currentUser.role === 'patient' ? (
                <>
                  <button
                    onClick={() => onTabChange('dashboard')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      currentTab === 'dashboard'
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Today's Schedule
                  </button>
                  <button
                    onClick={() => onTabChange('medicines')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      currentTab === 'medicines'
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Medicines
                  </button>
                  <button
                    onClick={() => onTabChange('inventory')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      currentTab === 'inventory'
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Stock & Expiry
                  </button>
                  <button
                    onClick={() => onTabChange('history')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      currentTab === 'history'
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Dose History
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onTabChange('caregiver')}
                    className={`px-3.5 py-2 rounded-xl transition ${
                      currentTab === 'caregiver'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    Caregiver Monitor
                  </button>
                </>
              )}

              {/* PBL College Details Button */}
              <button
                onClick={onOpenPBLInfo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition ml-2 border border-slate-200"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>PBL Project Details</span>
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <button
                onClick={() => onTabChange('landing')}
                className="hover:text-teal-700 transition"
              >
                Home
              </button>
              <a href="#features" className="hover:text-teal-700 transition">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-teal-700 transition">
                How It Works
              </a>
              <button
                onClick={onOpenPBLInfo}
                className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700 transition"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Project Team & Guide
              </button>
            </nav>
          )}

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Test Alert Button for presentation */}
            {currentUser && currentUser.role === 'patient' && (
              <button
                onClick={() => reminderService.triggerTestReminder()}
                title="Test Instant Audio & Browser Notification"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl hover:bg-amber-100 transition shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Simulate Due Alert</span>
              </button>
            )}

            {/* Notification Permission Bell */}
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestNotifications}
                title="Enable browser notifications for doses"
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition"
              >
                <BellRing className="w-3.5 h-3.5 text-teal-600 animate-bounce" />
                <span className="hidden sm:inline">Enable Alerts</span>
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 bg-white hover:border-teal-400 transition shadow-xs"
                >
                  <div className="flex flex-col text-right leading-tight hidden sm:flex">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        currentUser.role === 'patient' ? 'text-teal-600' : 'text-sky-600'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in text-sm">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            currentUser.role === 'patient'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          Role: {currentUser.role}
                        </span>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenRoleModal();
                          }}
                          className="text-[11px] text-teal-700 hover:underline font-semibold"
                        >
                          Switch Role
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Account Switcher for Viva & Evaluators */}
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                        Quick Demo Switcher
                      </p>
                      <button
                        onClick={() => handleSwitchUser('bhavanasreekalisetty1308@gmail.com')}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 transition ${
                          currentUser.email === 'bhavanasreekalisetty1308@gmail.com'
                            ? 'bg-teal-50 font-semibold text-teal-800'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">K. Bhavana Sree (Patient)</span>
                        {currentUser.email === 'bhavanasreekalisetty1308@gmail.com' && (
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSwitchUser('srinivas.faculty@geethanjali.edu.in')}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 transition ${
                          currentUser.email === 'srinivas.faculty@geethanjali.edu.in'
                            ? 'bg-sky-50 font-semibold text-sky-800'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">Prof. O. Srinivas (Caregiver)</span>
                        {currentUser.email === 'srinivas.faculty@geethanjali.edu.in' && (
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                        )}
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenPBLInfo();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                      >
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        College Project Info
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Sign-In</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in text-sm font-semibold">
          {currentUser ? (
            <>
              {currentUser.role === 'patient' ? (
                <>
                  <button
                    onClick={() => {
                      onTabChange('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl ${
                      currentTab === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                    }`}
                  >
                    Today's Schedule
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('medicines');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl ${
                      currentTab === 'medicines' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                    }`}
                  >
                    Medicines Management
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('inventory');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl ${
                      currentTab === 'inventory' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                    }`}
                  >
                    Stock & Expiry
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('history');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl ${
                      currentTab === 'history' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                    }`}
                  >
                    Dose History & Adherence
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onTabChange('caregiver');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-sky-50 text-sky-700"
                >
                  Caregiver Monitoring Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  onOpenPBLInfo();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-teal-700 bg-teal-50/50 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                PBL College Project Info
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onTabChange('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700"
              >
                Home
              </button>
              <button
                onClick={() => {
                  onOpenPBLInfo();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-teal-700 flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Project Team & Guide
              </button>
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

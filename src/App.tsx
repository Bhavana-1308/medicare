/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Medicine } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PatientDashboard } from './components/PatientDashboard';
import { MedicineManagement } from './components/MedicineManagement';
import { MedicineInventory } from './components/MedicineInventory';
import { DoseHistory } from './components/DoseHistory';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { RoleSelectModal } from './components/RoleSelectModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PBLProjectModal } from './components/PBLProjectModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { InAppReminderBanner } from './components/InAppReminderBanner';
import { AddEditMedicineModal } from './components/AddEditMedicineModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPBLModalOpen, setIsPBLModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentTab(user.role === 'caregiver' ? 'caregiver' : 'dashboard');
    } else {
      setCurrentTab('landing');
    }

    const handleDataChanged = () => {
      const updatedUser = StorageService.getCurrentUser();
      setCurrentUser(updatedUser);
    };

    window.addEventListener('medicare_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('medicare_data_changed', handleDataChanged);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    // If not authenticated and trying to navigate to private pages, open auth modal
    if (!currentUser && tab !== 'landing') {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (!user.role) {
      setIsRoleModalOpen(true);
    } else {
      setCurrentTab(user.role === 'caregiver' ? 'caregiver' : 'dashboard');
    }
  };

  const handleRoleSelected = (role: 'patient' | 'caregiver') => {
    if (currentUser) {
      const updated: UserProfile = { ...currentUser, role };
      setCurrentUser(updated);
      setIsRoleModalOpen(false);
      setCurrentTab(role === 'caregiver' ? 'caregiver' : 'dashboard');
    }
  };

  const handleSaveNewMedicine = (medData: Omit<Medicine, 'medicineId' | 'createdAt'>) => {
    StorageService.addMedicine(medData);
    setIsAddMedModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar Header */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenPBLInfo={() => setIsPBLModalOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Landing Page */}
        {currentTab === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (currentUser) {
                setCurrentTab(currentUser.role === 'caregiver' ? 'caregiver' : 'dashboard');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenPBLInfo={() => setIsPBLModalOpen(true)}
          />
        )}

        {/* Patient Dashboard */}
        {currentUser && currentUser.role === 'patient' && currentTab === 'dashboard' && (
          <PatientDashboard
            currentUser={currentUser}
            onNavigateTab={handleTabChange}
            onOpenAddMedicine={() => setIsAddMedModalOpen(true)}
          />
        )}

        {/* Medicines Management */}
        {currentUser && currentUser.role === 'patient' && currentTab === 'medicines' && (
          <MedicineManagement currentUser={currentUser} />
        )}

        {/* Stock & Expiry Inventory */}
        {currentUser && currentUser.role === 'patient' && currentTab === 'inventory' && (
          <MedicineInventory currentUser={currentUser} />
        )}

        {/* Dose History & Adherence */}
        {currentUser && currentUser.role === 'patient' && currentTab === 'history' && (
          <DoseHistory currentUser={currentUser} />
        )}

        {/* Caregiver Dashboard */}
        {currentUser && currentUser.role === 'caregiver' && currentTab === 'caregiver' && (
          <CaregiverDashboard currentUser={currentUser} />
        )}

        {/* If Caregiver tries to view patient-only tab, redirect smoothly */}
        {currentUser && currentUser.role === 'caregiver' && currentTab !== 'caregiver' && currentTab !== 'landing' && (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg">Caregiver View Active</h3>
            <p className="text-xs text-slate-500 mt-1">
              Caregiver accounts monitor linked patients via the Caregiver Supervision Portal.
            </p>
            <button
              onClick={() => setCurrentTab('caregiver')}
              className="mt-4 px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold"
            >
              Go to Caregiver Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Floating In-App Reminder Toasts */}
      <InAppReminderBanner />

      {/* Role Selection Modal */}
      {currentUser && (
        <RoleSelectModal
          user={currentUser}
          isOpen={isRoleModalOpen}
          onRoleSelected={handleRoleSelected}
          onClose={() => setIsRoleModalOpen(false)}
        />
      )}

      {/* User Profile & Settings Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSignOut={() => {
            StorageService.setCurrentUser(null);
            setCurrentUser(null);
            setCurrentTab('landing');
            setIsProfileModalOpen(false);
          }}
          onOpenRoleModal={() => {
            setIsProfileModalOpen(false);
            setIsRoleModalOpen(true);
          }}
        />
      )}

      {/* PBL Project Details & Dossier Modal */}
      <PBLProjectModal
        isOpen={isPBLModalOpen}
        onClose={() => setIsPBLModalOpen(false)}
      />

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add New Medicine Modal (Accessible globally from dashboard) */}
      {currentUser && (
        <AddEditMedicineModal
          isOpen={isAddMedModalOpen}
          onClose={() => setIsAddMedModalOpen(false)}
          onSave={handleSaveNewMedicine}
          userId={currentUser.uid}
        />
      )}
    </div>
  );
}

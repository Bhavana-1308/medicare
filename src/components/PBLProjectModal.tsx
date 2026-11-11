import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Users,
  Code2,
  Database,
  ShieldCheck,
  Server,
  Terminal,
  Layers,
  X,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface PBLProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PBLProjectModal: React.FC<PBLProjectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'architecture' | 'schema' | 'deployment'>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    
    // USERS COLLECTION
    match /users/{userId} {
      allow get: if request.auth != null && (request.auth.uid == userId || resource.data.email in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.linkedPatients);
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // MEDICINES COLLECTION
    match /medicines/{medicineId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        request.auth.token.email in get(/databases/$(database)/documents/users/$(resource.data.userId)).data.linkedCaregivers
      );
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // DOSE LOGS COLLECTION
    match /doseLogs/{logId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || 
        request.auth.token.email in get(/databases/$(database)/documents/users/$(resource.data.userId)).data.linkedCaregivers
      );
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                PBL Academic Engineering Project
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                MediCare – Project Dossier
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-semibold mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Project & Team
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'schema'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Firestore Schema & Rules
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'deployment'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Run & Deploy Guide
          </button>
        </div>

        {/* Tab 1: Project & Team Details */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Project Title
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  Medicine Reminder and Management System
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Project Based Learning (PBL)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Institution
                </span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  Geethanjali College of Engineering and Technology
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Department of Computer Science and Engineering (AI&ML)
                </p>
              </div>
            </div>

            {/* Guide & Students */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                      Faculty Guide
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">O. Srinivas</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600">Designation: Associate Professor</p>
                <p className="text-xs text-slate-500">
                  Department of Computer Science and Engineering (AI&ML)
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Project Team Members
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">B.Tech CSE (AI&ML)</h4>
                  </div>
                </div>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800">1. K. Bhavana Sree</span>
                    <span className="font-mono text-teal-700 font-semibold">25R11A6697</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="font-bold text-slate-800">2. R. Meghana</span>
                    <span className="font-mono text-teal-700 font-semibold">25R11A66B3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Project Goals */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm mb-1">PBL Engineering Objectives:</h4>
              <p>
                • <strong>Zero Missed Doses:</strong> Intelligent background scanner triggering system notifications and audio alarms even when working on other tabs.
              </p>
              <p>
                • <strong>Inventory Integrity:</strong> Automatic stock decrements with atomic anti-duplicate locks preventing double deductions on repeated clicks.
              </p>
              <p>
                • <strong>Tele-Caregiver Synchronization:</strong> Remote supervision for doctors and family guardians to inspect real-time patient adherence without granting write tampering rights.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: System Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">System Layer Architecture</h3>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono space-y-3 leading-relaxed">
              <div className="text-teal-400 font-bold">1. PRESENTATION LAYER (React 19 + Tailwind CSS)</div>
              <div className="text-slate-300 pl-4">
                ├─ LandingPage (Educational PBL Hero, Features, Workflow)
                <br />
                ├─ PatientDashboard (Summary Cards, Today's Schedule, Stock Decrement)
                <br />
                ├─ MedicineManagement (CRUD, Dosage, Custom Timings, Safety Filters)
                <br />
                ├─ MedicineInventory (Low Stock & Expiry Warnings, Refill Modal)
                <br />
                ├─ DoseHistory (Adherence Analytics, 7-Day Chart, CSV Audit Export)
                <br />
                └─ CaregiverDashboard (Patient Linking, Read-Only Supervision, Nudge)
              </div>

              <div className="text-sky-400 font-bold mt-3">2. CLIENT SERVICES & ENGINE LAYER</div>
              <div className="text-slate-300 pl-4">
                ├─ ReminderService (Web Notification API, Interval Poller, Due Matrix)
                <br />
                ├─ SoundService (Dual-Tone Web Audio API Medical Chime Synthesizer)
                <br />
                └─ StorageService (Reactive Firestore Mirror with Event Dispatches)
              </div>

              <div className="text-amber-400 font-bold mt-3">3. DATA & SECURITY LAYER (Cloud Firestore)</div>
              <div className="text-slate-300 pl-4">
                ├─ /users/{`{userId}`} (UID, Role: Patient/Caregiver, Linked Relations)
                <br />
                ├─ /medicines/{`{medicineId}`} (Prescription Specs, Timings, Stock)
                <br />
                └─ /doseLogs/{`{logId}`} (Immutable Compliance History & Audit Logs)
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Schema & Security Rules */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Firestore Security Rules</h3>
                <p className="text-xs text-slate-400">ABAC Access Control protecting patient records</p>
              </div>
              <button
                onClick={() => copyToClipboard(sampleRules, 'rules')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'rules' ? 'Copied' : 'Copy Rules'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-teal-300 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
              {sampleRules}
            </pre>
          </div>
        )}

        {/* Tab 4: Deployment Guide */}
        {activeTab === 'deployment' && (
          <div className="space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">How to Run Locally & Deploy to Firebase</h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <p className="font-bold text-slate-800">1. Run Locally:</p>
              <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs">
{`npm install
npm run dev`}
              </pre>
              <p className="text-slate-500">Access application at http://localhost:3000</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <p className="font-bold text-slate-800">2. Deploy to Firebase Hosting:</p>
              <pre className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs">
{`npm run build
firebase init hosting
firebase deploy --only hosting,firestore:rules`}
              </pre>
              <p className="text-slate-500">
                All production static assets in <code className="text-teal-700">dist/</code> will be live on Firebase global CDN.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Geethanjali College of Engineering and Technology • CSE (AI&ML)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

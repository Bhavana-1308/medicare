import React from 'react';
import {
  Pill,
  Bell,
  Package,
  Calendar,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Users,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onOpenPBLInfo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreFeatures,
  onOpenPBLInfo,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/60 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Undergraduate Engineering PBL Showcase</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Never Miss a Dose.{' '}
                <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-600 bg-clip-text text-transparent">
                  Take Control of Your Health.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A modern healthcare management system designed to eliminate missed medications. Receive proactive browser reminders, track real-time pill inventory, avoid expired medicines, and connect linked caregivers for uninterrupted peace of mind.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onExploreFeatures}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-base"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-extrabold text-teal-700">98.4%</div>
                  <div className="text-xs text-slate-500 font-medium">Adherence Target</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-teal-700">0</div>
                  <div className="text-xs text-slate-500 font-medium">Duplicate Deductions</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-teal-700">Real-Time</div>
                  <div className="text-xs text-slate-500 font-medium">Caregiver Sync</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live App Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden p-6 space-y-4">
                {/* Header of Mockup */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <Pill className="w-5 h-5 -rotate-45" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Today's Schedule</h3>
                      <p className="text-xs text-slate-400">Wednesday, Nov 11 • 2 doses left</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                    Live Demo
                  </span>
                </div>

                {/* Sample Schedule Cards */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Metformin 500 mg</div>
                        <div className="text-[11px] text-teal-800">08:30 AM • Taken with Breakfast</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      Taken
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Paracetamol Dolo 650mg</div>
                        <div className="text-[11px] text-amber-800">02:00 PM • Dose Due Now</div>
                      </div>
                    </div>
                    <button
                      onClick={onGetStarted}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition shadow-xs"
                    >
                      Take
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Atorvastatin 10 mg</div>
                        <div className="text-[11px] text-slate-500">09:30 PM • Before sleep</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Upcoming
                    </span>
                  </div>
                </div>

                {/* Stock Warning Highlight */}
                <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Low Stock Alert:</strong> Paracetamol has 5 tablets remaining (Threshold: 8).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Comprehensive Health Companion
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Complete Medication Safety
            </h3>
            <p className="text-slate-600 mt-3 text-base">
              MediCare brings hospital-grade compliance protocols to your browser, helping you maintain a seamless schedule with zero guesswork.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">1. Smart Medicine Reminders</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automated scheduler scanning active prescriptions every minute. Generates browser system notifications, dual-tone medical chimes, and instant in-app actionable alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">2. Medicine Stock Tracking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatically decrements pill count when doses are recorded as taken. Enforces anti-duplicate deduction guards to prevent skewing inventory levels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">3. Expiry Date Alerts</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Color-coded warning matrix identifying medications that are past their safety date or entering the critical 30-day expiration window.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">4. Dose History & Adherence</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Comprehensive audit trail tracking taken, skipped, and missed doses with timestamps. Visual analytics show your 7-day adherence percentage and streak.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">5. Caregiver Monitoring</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Doctors, family members, and guardians can securely link to patients via registered email. Monitor compliance in real-time with read-only data safety.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Firebase Cloud Architecture</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Structured Firestore schemas for Users, Medicines, and DoseLogs with Attribute-Based Access Control (ABAC) security rules safeguarding user privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Simple 3-Step Routine
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How MediCare Protects Your Health
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Log Your Prescription</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Input your medicines with dosage, frequency, specific times, current stock quantity, and expiry dates into your private portal.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Receive Timely Reminders</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                When dose time arrives, MediCare sounds a gentle chime and notifies your browser. Click "Mark Taken" with a single tap.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Track & Sync with Caregivers</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your adherence rate updates live, stocks auto-decrease, and linked caregivers can monitor your wellness remotely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About The Project Section (PBL Requirement) */}
      <section id="about" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-teal-800/80 pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                      Academic Engineering Project
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Project Based Learning (PBL) Showcase
                    </h3>
                  </div>
                </div>

                <button
                  onClick={onOpenPBLInfo}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>View Project Dossier</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Project Title</p>
                  <p className="font-bold text-white text-base mt-1">Medicine Reminder & Management System</p>
                  <p className="text-slate-400 text-xs mt-1">Undergraduate PBL Project</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Institution</p>
                  <p className="font-bold text-white text-base mt-1">Geethanjali College of Engineering and Technology</p>
                  <p className="text-slate-400 text-xs mt-1">Dept of CSE (AI & ML)</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Faculty Guide</p>
                  <p className="font-bold text-white text-base mt-1">Prof. O. Srinivas</p>
                  <p className="text-slate-400 text-xs mt-1">Associate Professor, CSE (AI&ML)</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Project Team</p>
                  <div className="mt-1 space-y-1">
                    <p className="font-semibold text-white text-xs">1. K. Bhavana Sree <span className="text-teal-300 font-mono text-[11px]">(25R11A6697)</span></p>
                    <p className="font-semibold text-white text-xs">2. R. Meghana <span className="text-teal-300 font-mono text-[11px]">(25R11A66B3)</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-900 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <p className="font-bold text-white">MediCare</p>
              <p className="text-xs text-slate-400">Medicine Reminder & Management System</p>
            </div>
          </div>

          <div className="text-xs text-center sm:text-right text-slate-400">
            <p>© 2026 Geethanjali College of Engineering and Technology.</p>
            <p className="mt-0.5">Developed by K. Bhavana Sree & R. Meghana • Guided by Prof. O. Srinivas</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

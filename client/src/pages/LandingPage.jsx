import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Syringe,
  Baby,
  HeartPulse,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Megaphone,
  Building2,
  FileCheck2,
  UserCheck,
  UserPlus,
  MailCheck,
  PhoneCall,
  MapPin,
  X
} from 'lucide-react';

const SERVICES = [
  {
    id: 'consultation',
    title: 'General Medical Consultation',
    description: 'Free physical checkups, general medical diagnosis, and physician prescription for all registered residents.',
    icon: Stethoscope,
    badge: 'Daily Service',
    time: '8:00 AM - 4:00 PM',
    category: 'General Medicine',
  },
  {
    id: 'vaccination',
    title: 'Immunization & Vaccination',
    description: 'Childhood vaccinations, anti-rabies, influenza boosters, and pneumonia shots for vulnerable groups.',
    icon: Syringe,
    badge: 'Essential',
    time: 'Tue & Thu 9:00 AM',
    category: 'Immunization',
  },
  {
    id: 'prenatal',
    title: 'Maternal & Prenatal Care',
    description: 'Pregnancy tracking, routine fetal monitoring, maternal vitamins allocation, and post-partum care.',
    icon: HeartPulse,
    badge: 'Maternal Health',
    time: 'Mon & Wed 8:00 AM',
    category: 'Maternal Care',
  },
  {
    id: 'dental',
    title: 'Barangay Dental Clinic',
    description: 'Tooth extraction, oral prophylaxis, cavity prevention, and dental emergency care.',
    icon: Sparkles,
    badge: 'Dental',
    time: 'Fridays 9:00 AM',
    category: 'Oral Health',
  },
  {
    id: 'pediatric',
    title: 'Child Health & Nutrition Program',
    description: 'Growth monitoring, weight tracking, vitamin A supplementation, and deworming administration.',
    icon: Baby,
    badge: 'Pediatric',
    time: 'Wednesdays 1:00 PM',
    category: 'Child Care',
  },
  {
    id: 'senior',
    title: 'Senior Citizen Health & Maintenance',
    description: 'Blood pressure screening, diabetes monitoring, and free monthly maintenance medicine distribution.',
    icon: ShieldCheck,
    badge: 'Senior Care',
    time: 'Daily 8:00 AM',
    category: 'Geriatric Care',
  },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    date: 'July 25, 2026',
    title: 'Free Anti-Flu & Pneumonia Vaccination Drive',
    category: 'Special Campaign',
    content: 'All senior citizens aged 60 and above are invited to the Barangay Multipurpose Hall for free immunization.',
    urgent: true,
  },
  {
    id: 2,
    date: 'July 22, 2026',
    title: 'Dengue Prevention & Fogging Schedule',
    category: 'Community Health',
    content: 'Barangay health workers will conduct indoor and outdoor thermal fogging across Zones 1 to 4 this Saturday.',
    urgent: false,
  },
  {
    id: 3,
    date: 'July 18, 2026',
    title: 'Expanded Lab Request & Blood Typing Services',
    category: 'Facility Update',
    content: 'Our health center now offers rapid blood glucose testing and complete blood count (CBC) diagnostic requests.',
    urgent: false,
  },
];

const FLOWCHART_STEPS = [
  {
    step: '01',
    title: 'Access Portal & Browse',
    description: 'Explore available free healthcare services and public health bulletins.',
    icon: Building2,
  },
  {
    step: '02',
    title: 'Residency Check',
    description: 'Verify existing Barangay record or register your residency profile.',
    icon: UserCheck,
  },
  {
    step: '03',
    title: 'Choose Service & Slot',
    description: 'Pick your preferred date, time slot, and healthcare service type.',
    icon: Calendar,
  },
  {
    step: '04',
    title: 'Staff Review & Confirmation',
    description: 'Staff approves slot, updates records, and sends email QR ticket pass.',
    icon: MailCheck,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Decision Modal State: "Would you like to book an appointment?"
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showExitScreen, setShowExitScreen] = useState(false);

  const handleOpenDecisionPrompt = () => {
    setShowDecisionModal(true);
  };

  const handleDecisionYes = () => {
    setShowDecisionModal(false);
    // Flowchart: Yes -> Proceed to residency verification / portal check
    navigate('/user/verify-residency');
  };

  const handleDecisionNo = () => {
    setShowDecisionModal(false);
    // Flowchart: No -> Exit / Thank You screen
    setShowExitScreen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">

      {/* HERO BANNER SECTION */}
      <section className="bg-slate-50 text-slate-800 relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        {/* Modern ambient radial glow effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">

            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Official Barangay Health Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Quality Community Healthcare, <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent">Right at Your Doorstep</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              Welcome to the official Barangay Healthcare Services & Online Appointment System. Access free medical checkups, immunization schedules, diagnostic requests, and maternal care for all verified barangay residents.
            </p>

            {/* Hero CTA Button Stack (Fixed Button Positions & Equal Alignment) */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleOpenDecisionPrompt}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 text-base"
              >
                <Calendar className="w-5 h-5" />
                <span>Book an Appointment Now</span>
              </button>

              <a
                href="#services"
                className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold rounded-2xl border border-slate-300 transition flex items-center justify-center gap-2 text-base text-center shadow-sm"
              >
                <span>Browse Health Services</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600">100% Free</div>
                <div className="text-xs text-slate-600 font-semibold">For Barangay Residents</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600">6+ Programs</div>
                <div className="text-xs text-slate-600 font-semibold">Core Healthcare Services</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600">Mon - Sat</div>
                <div className="text-xs text-slate-600 font-semibold">8:00 AM - 5:00 PM</div>
              </div>
            </div>

          </div>

          {/* Right Hero Card / Operational Status Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl text-slate-800 relative">

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 font-sans">Health Center Status</h3>
                  <p className="text-xs text-emerald-700 font-bold">Barangay Main Health Clinic</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> OPEN TODAY
                </span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Duty Physician:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" /> Dr. Maria Santos, MD
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Duty Health Nurse:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-teal-600" /> Nurse Ramon Reyes, RN
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Available Slots Today:</span>
                  <span className="font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    14 Slots Remaining
                  </span>
                </div>
              </div>

              {/* Single Click Action */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleOpenDecisionPrompt}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-center text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Appointment Slot</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SYSTEM FLOWCHART WORKFLOW VISUALIZER */}
      <section className="py-12 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
              System Flowchart Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">How the Appointment Portal Works</h2>
            <p className="text-slate-600 text-sm mt-1">
              A transparent, 4-step workflow connecting residents directly with barangay healthcare staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLOWCHART_STEPS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/20">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">{item.step}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1">{item.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>Flowchart Stage {idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 1: Browse Health Services */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            Available Programs
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Barangay Healthcare Services</h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
            Browse our comprehensive medical and diagnostic services provided free of charge for registered residents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc) => {
            const IconComponent = svc.icon;
            return (
              <div
                key={svc.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{svc.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {svc.time}
                  </span>

                  {/* Fixed Position Button: Right aligned */}
                  <button
                    type="button"
                    onClick={handleOpenDecisionPrompt}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/80 rounded-xl font-bold transition-all flex items-center gap-1 text-xs"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Health Bulletins & Announcements */}
      <section className="py-16 bg-slate-100/80 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                Public Health Advisories
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">Barangay Health Bulletins</h2>
              <p className="text-slate-600 mt-1 text-xs sm:text-sm">Stay informed with official medical notices and community health drives.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANNOUNCEMENTS.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${item.urgent ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-400 font-semibold">{item.date}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${item.urgent ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.content}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Barangay Health Board
                  </span>
                  <span className="text-slate-400 font-medium">Verified Bulletin</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-slate-800 shadow-xl relative overflow-hidden border border-slate-200">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <Stethoscope className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Need Medical Attention or a Health Checkup?
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Book your appointment online in under 2 minutes. Skip long queues and ensure your priority slot with our healthcare personnel.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenDecisionPrompt}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 transition transform hover:scale-105 text-base flex items-center justify-center gap-2 mx-auto"
              >
                <Calendar className="w-5 h-5" />
                <span>Would you like to book an appointment?</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* FLOWCHART DECISION MODAL: "Would you like to book an appointment?"     */}
      {/* ======================================================================= */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center border border-slate-100 relative overflow-hidden">

            <button
              onClick={() => setShowDecisionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
              <HelpCircle className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Flowchart Decision Point 1
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 mb-2">
              Would you like to book an appointment?
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Booking an appointment reserves your priority schedule at the Barangay Health Center and streamlines your residency verification.
            </p>

            {/* Fixed Action Buttons Stack */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDecisionYes}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-900/20 transition text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>YES, Book an Appointment</span>
              </button>

              <button
                type="button"
                onClick={handleDecisionNo}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>NO, Just Browsing (Exit Portal)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* FLOWCHART EXIT / THANK YOU SCREEN ("If No")                             */}
      {/* ======================================================================= */}
      {showExitScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center border border-emerald-100 relative">

            <button
              onClick={() => setShowExitScreen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-200">
              <HeartPulse className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Barangay Health Services Portal
            </span>

            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 mb-2">
              Thank You for Visiting!
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Thank you for exploring our health services and announcements. Your health and well-being are our highest priority. Feel free to return anytime to book an appointment or check updated health bulletins.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 mb-6 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-slate-900">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Health Center Contacts & Info:
              </p>
              <p className="pl-5">• Emergency Desk: (02) 8888-HEALTH</p>
              <p className="pl-5">• Clinic Address: Barangay Multipurpose Health Complex, Zone 3</p>
              <p className="pl-5">• Operating Hours: Mon - Sat | 8:00 AM - 5:00 PM</p>
            </div>

            {/* Standardized Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowExitScreen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close & Continue Browsing
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitScreen(false);
                  navigate('/user/verify-residency');
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Change Mind: Book Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

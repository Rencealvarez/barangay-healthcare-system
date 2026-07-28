import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  MailCheck,
  Printer,
  Calendar,
  Home,
  QrCode,
  Clock,
  User,
  Activity,
  FileText,
  Building2,
  Info
} from 'lucide-react';

export default function AppointmentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const stateData = location.state?.appointment;
    if (stateData) {
      setAppointment(stateData);
    } else {
      const stored = sessionStorage.getItem('latest_appointment') || localStorage.getItem('latest_appointment');
      if (stored) {
        try {
          setAppointment(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [location]);

  const data = appointment || {
    id: 10842,
    reference_number: 'BHC-APT-00842',
    user_id: 1,
    resident_name: 'Juan Dela Cruz',
    contact_number: '0917-123-4567',
    service_type: 'General Consultation',
    preferred_date: '2026-07-27',
    preferred_time: '09:00:00',
    reason: 'Routine blood pressure checkup and general physical consultation.',
    status: 'Pending',
    created_at: new Date().toISOString(),
  };

  const formattedTime = data.preferred_time ? (
    data.preferred_time.includes('09:00') ? '09:00 AM' :
    data.preferred_time.includes('10:00') ? '10:00 AM' :
    data.preferred_time.includes('11:00') ? '11:00 AM' :
    data.preferred_time.includes('13:00') ? '01:00 PM' :
    data.preferred_time.includes('14:00') ? '02:00 PM' :
    data.preferred_time.includes('15:00') ? '03:00 PM' : data.preferred_time
  ) : '09:00 AM';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Success Header Box */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-200/80 text-center animate-fade-in space-y-6">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              System Flowchart Step 4: Appointment Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Appointment Request Successfully Submitted!
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              Your appointment has been registered into the Barangay Health System queue and is currently undergoing healthcare staff schedule verification.
            </p>
          </div>

          {/* Email Confirmation Notification Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-left flex items-start gap-3 text-xs sm:text-sm text-teal-900 shadow-sm">
            <MailCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-teal-900">Automated Confirmation Email Sent!</p>
              <p className="text-teal-800 text-xs mt-0.5 leading-relaxed">
                An automated confirmation email containing your appointment schedule summary and digital QR check-in pass has been dispatched to your registered email address.
              </p>
            </div>
          </div>

          {/* Appointment Ticket Card */}
          <div className="my-6 p-6 sm:p-8 bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-200 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 relative z-10">
              <div>
                <span className="text-xs font-mono text-emerald-800 uppercase tracking-widest font-extrabold">Official Appointment Ticket Pass</span>
                <div className="text-2xl font-mono font-black text-slate-950">{data.reference_number || `BHC-APT-${String(data.id || 1).padStart(5, '0')}`}</div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {data.status === 'Approved' ? 'Confirmed & Approved' : 'Pending Staff Review'}
                </span>
              </div>
            </div>

            {/* Ticket Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs sm:text-sm relative z-10">
              <div>
                <span className="text-slate-500 text-xs font-bold">Resident / Patient:</span>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">{data.resident_name || 'Valued Barangay Resident'}</p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold">Service Category:</span>
                <p className="font-extrabold text-emerald-800 text-base mt-0.5">{data.service_type}</p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold">Requested Visit Date:</span>
                <p className="font-extrabold text-slate-900 mt-0.5">{data.preferred_date}</p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold">Time Slot:</span>
                <p className="font-extrabold text-slate-900 mt-0.5">{formattedTime}</p>
              </div>

              {data.reason && (
                <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                  <span className="text-slate-550 text-xs font-bold">Visit Reason / Chief Complaint:</span>
                  <p className="text-slate-700 text-xs italic mt-1 font-semibold">"{data.reason}"</p>
                </div>
              )}
            </div>

            {/* Mock Digital QR Pass */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs text-slate-500 font-bold font-mono">Barangay Health Center Check-in Pass</p>
                <p className="text-xs font-mono font-bold text-slate-800">VALIDATED • PRESENT UPON ENTRY</p>
              </div>

              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-800 flex items-center gap-1.5 font-mono text-xs font-extrabold shadow-xs border border-slate-300">
                <QrCode className="w-5 h-5 text-slate-900" />
                <span>QR CHECK-IN</span>
              </div>
            </div>

          </div>

          {/* Visit Reminders List */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-slate-700">
            <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" /> Important Reminders for Health Center Visit:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>Please arrive 10-15 minutes prior to your allocated time slot.</li>
              <li>Bring a valid Barangay Resident ID or Government-issued ID card.</li>
              <li>Wear a face mask if experiencing respiratory symptoms (cough, cold, fever).</li>
              <li>Present this confirmation slip (printed or on smartphone screen) at the triage desk.</li>
            </ul>
          </div>

          {/* Fixed Bottom Action Buttons Stack */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket Pass</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/user/book-appointment' : '/book-appointment')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Another Appointment</span>
            </button>

            <Link
              to="/"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Portal Home</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

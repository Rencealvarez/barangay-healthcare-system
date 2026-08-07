import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

export default function UserDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo appointments for instant testing
  const DEMO_MY_APPOINTMENTS = [
    {
      id: 101,
      reference_number: 'BHC-APT-00101',
      service_type: 'General Consultation',
      preferred_date: '2026-07-28',
      preferred_time: '09:00:00',
      reason: 'Routine checkup & blood pressure monitoring.',
      status: 'Approved',
      assigned_doctor: 'Dr. Maria Santos, MD',
      assigned_room: 'Consultation Room 1',
    },
    {
      id: 102,
      reference_number: 'BHC-APT-00102',
      service_type: 'Vaccination / Immunization',
      preferred_date: '2026-08-02',
      preferred_time: '10:30:00',
      reason: 'Flu booster vaccine.',
      status: 'Pending',
      assigned_doctor: 'Awaiting Staff Review',
      assigned_room: 'Station A',
    },
  ];

  useEffect(() => {
    axiosClient
      .get('/user/appointments')
      .then((res) => {
        if (res.data?.data) {
          setAppointments(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load user appointments:', err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white border-l-8 border-emerald-600 border-t border-r border-b border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-800 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          {user?.resident ? (
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
              ✅ Active Barangay Residency Verified
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              ⚠️ Residency Status Unverified
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Magandang Araw, {user?.resident?.full_name || user?.name || 'Maria Clara'}!
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed font-semibold">
            Welcome to your Barangay Healthcare Portal. View your upcoming medical consultations, schedule health center appointments, and review your personal health records.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/user/book-appointment"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5"
            >
              <span>➕</span> Book New Consultation
            </Link>
            <Link
              to="/user/medical-records"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all"
            >
              📋 View Medical Records
            </Link>
            {!user?.resident && (
              <Link
                to="/user/verify-residency"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>🔍</span> Verify Residency Status
              </Link>
            )}
          </div>
        </div>
        <div className="absolute right-4 bottom-0 opacity-5 pointer-events-none text-9xl">
          🏥
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Upcoming Appointments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {appointments.filter((a) => a.status === 'Pending' || a.status === 'Approved').length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            📅
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Approved Tickets</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {appointments.filter((a) => a.status === 'Approved').length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">
            ✅
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Medical History Items</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {appointments.filter((a) => a.status === 'Completed').length} {appointments.filter((a) => a.status === 'Completed').length === 1 ? 'Record' : 'Records'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            📑
          </div>
        </div>
      </div>

      {/* My Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Appointment Requests</h2>
            <p className="text-xs text-slate-500">Track real-time approval status from health staff</p>
          </div>
          <Link
            to="/user/book-appointment"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            + Request Another
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="text-4xl">📅</div>
            <div className="text-slate-900 font-bold text-base">No active appointments found.</div>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              You don't have any scheduled consultations or appointment slots reserved. Book one now to speak with a healthcare provider.
            </p>
            <Link
              to="/user/book-appointment"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all transform active:scale-95"
            >
              ➕ Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {apt.reference_number || `BHC-APT-00${apt.id}`}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        apt.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : apt.status === 'Pending'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-rose-100 text-rose-950 border border-rose-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{apt.service_type}</h3>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Date & Time:</span> {apt.preferred_date} at {apt.preferred_time}
                  </p>
                  {apt.reason && (
                    <p className="text-xs text-slate-500 italic">"{apt.reason}"</p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right min-w-[200px]">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Assigned Care Provider</div>
                  <div className="text-xs font-bold text-slate-800">{apt.assigned_doctor || 'Health Staff Queue'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{apt.assigned_room || 'Barangay Health Center'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

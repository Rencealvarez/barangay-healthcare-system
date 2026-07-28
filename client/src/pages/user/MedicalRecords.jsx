import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/user/medical-records')
      .then((res) => {
        if (res.data?.data) {
          setRecords(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load medical records:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Personal Health History</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Medical Records & Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official health records on file at Barangay Health Station for <span className="font-semibold text-slate-700">{user?.resident?.full_name || user?.name || 'Maria Clara Santos'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-300"
          >
            🖨️ Print Records
          </button>
        </div>
      </div>

      {/* Medical History List */}
      {loading ? (
        <div className="bg-white p-8 text-center text-sm text-slate-400 rounded-2xl border border-slate-200">
          Loading medical history records...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="text-4xl">🩺</div>
          <h3 className="text-slate-900 font-bold text-base">No Medical Records on File</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed font-semibold">
            You don't have any past consultation summaries or prescriptions recorded in our system. Once you complete a checkup consultation, your notes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🩺</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{record.type}</h3>
                    <div className="text-xs text-slate-500">Date of Visit: {record.date} • Provider: {record.attending}</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-805">Clinical Assessment / Findings:</div>
                  <p className="text-slate-700 font-semibold">{record.diagnosis}</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                  <div className="font-extrabold text-emerald-950">Rx / Prescriptions & Advice:</div>
                  <p className="text-emerald-900 font-mono font-bold">{record.prescription}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

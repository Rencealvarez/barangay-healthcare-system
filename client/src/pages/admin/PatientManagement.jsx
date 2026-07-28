import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const MOCK_PATIENTS = [
  {
    id: 1,
    resident_id: 'RES-2026-8891',
    full_name: 'Maria Clara Santos',
    age: 28,
    gender: 'Female',
    purok_zone: 'Zone 1',
    contact_number: '09171234567',
    blood_type: 'O+',
    residency_status: 'Verified',
    consultation_count: 5,
  },
  {
    id: 2,
    resident_id: 'RES-2026-8892',
    full_name: 'Jose Rizal',
    age: 35,
    gender: 'Male',
    purok_zone: 'Zone 2',
    contact_number: '09189876543',
    blood_type: 'A+',
    residency_status: 'Verified',
    consultation_count: 3,
  },
  {
    id: 3,
    resident_id: 'RES-2026-8893',
    full_name: 'Andres Bonifacio',
    age: 62,
    gender: 'Male',
    purok_zone: 'Zone 3',
    contact_number: '09195551234',
    blood_type: 'B+',
    residency_status: 'Verified (Senior Citizen)',
    consultation_count: 12,
  },
  {
    id: 4,
    resident_id: 'RES-2026-8894',
    full_name: 'Gabriela Silang',
    age: 41,
    gender: 'Female',
    purok_zone: 'Zone 1',
    contact_number: '09201112233',
    blood_type: 'AB+',
    residency_status: 'Pending Verification',
    consultation_count: 1,
  },
];

export default function PatientManagement() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingData, setEditingData] = useState({
    blood_type: '',
    allergies: '',
    medical_history: '',
    purok_zone: '',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/patients');
      if (response.data?.status === 'success') {
        setPatients(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setPatients(MOCK_PATIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setEditingData({
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      medical_history: patient.medical_history || '',
      purok_zone: patient.purok_zone || '',
    });
  };

  const handleSavePatient = async () => {
    try {
      const response = await axiosClient.put(`/admin/patients/${selectedPatient.id}`, editingData);
      if (response.data?.status === 'success') {
        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, ...editingData } : p));
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Failed to update patient:', err);
      alert('Error updating patient record.');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.resident_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.purok_zone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-700 uppercase">Master Resident Health Registry</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Patient Records & Census</h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Access verified resident health files, consultation history, and emergency contact details.
          </p>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search patient by name, resident ID, or purok zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-white border border-slate-350 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-650 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-400/80 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {patient.resident_id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{patient.full_name}</h3>
                  <div className="text-xs text-slate-600 font-semibold">
                    {patient.age} yrs old • {patient.gender} • Blood Type: <span className="text-emerald-700 font-extrabold">{patient.blood_type}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold rounded-full">
                  {patient.residency_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-3 text-slate-700">
                <div>
                  <span className="text-slate-550 font-bold">Purok/Zone:</span> <span className="font-bold">{patient.purok_zone}</span>
                </div>
                <div>
                  <span className="text-slate-550 font-bold">Phone:</span> <span className="font-bold">{patient.contact_number}</span>
                </div>
                <div>
                  <span className="text-slate-550 font-bold">Total Visits:</span> <span className="font-extrabold text-indigo-700">{patient.consultation_count} consultations</span>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => handleEditClick(patient)}
                  className="px-6 py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-700 rounded-xl text-sm font-extrabold transition-all shadow-sm min-h-[48px]"
                >
                  📄 Edit Clinical Health File
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Patient File Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-700 font-bold">{selectedPatient.resident_id}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedPatient.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-500 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 font-semibold">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-indigo-700 text-sm">Demographic Profile</div>
                <div>Age / Gender: {selectedPatient.age} years old ({selectedPatient.gender})</div>
                <div>Contact: {selectedPatient.contact_number}</div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Purok / Zone:</label>
                  <input
                    type="text"
                    value={editingData.purok_zone}
                    onChange={(e) => setEditingData(prev => ({ ...prev, purok_zone: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-emerald-800 text-sm">Clinical Data</div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Blood Group:</label>
                  <input
                    type="text"
                    value={editingData.blood_type}
                    onChange={(e) => setEditingData(prev => ({ ...prev, blood_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Chronic Conditions / Medical History:</label>
                  <textarea
                    value={editingData.medical_history}
                    onChange={(e) => setEditingData(prev => ({ ...prev, medical_history: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-xs min-h-[60px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Allergies:</label>
                  <input
                    type="text"
                    value={editingData.allergies}
                    onChange={(e) => setEditingData(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl border border-slate-300 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePatient}
                className="px-5 py-3 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-extrabold rounded-xl border border-indigo-700 min-h-[44px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

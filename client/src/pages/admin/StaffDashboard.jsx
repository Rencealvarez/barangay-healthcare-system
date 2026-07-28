import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  FileText,
  Stethoscope,
  Building2,
  User,
  Mail,
  AlertTriangle,
  X,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

const DEMO_APPOINTMENTS = [
  {
    id: 101,
    reference_number: 'BHC-APT-00101',
    user_id: 1,
    resident_name: 'Maria Clara Santos',
    contact_number: '09171234567',
    service_type: 'General Consultation',
    preferred_date: '2026-07-25',
    preferred_time: '09:00:00',
    reason: 'Frequent headaches and mild dizziness for 3 days.',
    status: 'Pending',
    created_at: '2026-07-24T08:00:00Z',
    assigned_doctor: '',
    assigned_room: '',
    rejection_reason: '',
  },
  {
    id: 102,
    reference_number: 'BHC-APT-00102',
    user_id: 2,
    resident_name: 'Jose Rizal',
    contact_number: '09189876543',
    service_type: 'Vaccination',
    preferred_date: '2026-07-25',
    preferred_time: '10:00:00',
    reason: 'Annual flu booster vaccination.',
    status: 'Pending',
    created_at: '2026-07-24T09:15:00Z',
    assigned_doctor: '',
    assigned_room: '',
    rejection_reason: '',
  },
  {
    id: 103,
    reference_number: 'BHC-APT-00103',
    user_id: 3,
    resident_name: 'Andres Bonifacio',
    contact_number: '09195551234',
    service_type: 'Senior Citizen Checkup',
    preferred_date: '2026-07-26',
    preferred_time: '08:00:00',
    reason: 'Monthly hypertension maintenance medicine allocation.',
    status: 'Approved',
    created_at: '2026-07-23T14:30:00Z',
    assigned_doctor: 'Dr. Maria Santos, MD',
    assigned_room: 'Consultation Room 1',
    rejection_reason: '',
  },
  {
    id: 104,
    reference_number: 'BHC-APT-00104',
    user_id: 4,
    resident_name: 'Emilio Aguinaldo',
    contact_number: '09204443322',
    service_type: 'Dental Care',
    preferred_date: '2026-07-24',
    preferred_time: '14:00:00',
    reason: 'Tooth extraction consult.',
    status: 'Rejected',
    created_at: '2026-07-22T10:00:00Z',
    assigned_doctor: '',
    assigned_room: '',
    rejection_reason: 'Dentist on official leave on requested date. Please reschedule for Friday.',
  },
];

const getServiceTypeStyles = (serviceType) => {
  const normalized = (serviceType || '').toLowerCase();
  if (normalized.includes('general')) {
    return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
  }
  if (normalized.includes('vaccin') || normalized.includes('immun')) {
    return 'bg-teal-50 text-teal-700 border border-teal-100';
  }
  if (normalized.includes('dental')) {
    return 'bg-violet-50 text-violet-700 border border-violet-100';
  }
  if (normalized.includes('senior') || normalized.includes('elder')) {
    return 'bg-amber-50 text-amber-700 border border-amber-100';
  }
  return 'bg-slate-50 text-slate-700 border border-slate-100';
};

const formatSchedule = (dateStr, timeStr) => {
  if (!dateStr) return '';
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    let formattedDate = dateStr;
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        formattedDate = `${months[monthIdx]} ${day}, ${year}`;
      }
    }
    
    let formattedTime = '';
    if (timeStr) {
      const timeParts = timeStr.split(':');
      if (timeParts.length >= 2) {
        let hour = parseInt(timeParts[0], 10);
        const minute = timeParts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        formattedTime = `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
      }
    }
    
    return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
  } catch (e) {
    return `${dateStr} ${timeStr}`;
  }
};

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item for Detail Review Modal
  const [selectedApt, setSelectedApt] = useState(null);
  
  // Approval Form State
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Maria Santos, MD');
  const [assignedRoom, setAssignedRoom] = useState('Consultation Room 1');
  
  // Rejection Form State: "reject request enter reason"
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/appointments');
      const apiData = response.data?.data || response.data;
      if (Array.isArray(apiData) && apiData.length > 0) {
        setAppointments(apiData);
      } else {
        setAppointments(DEMO_APPOINTMENTS);
      }
    } catch (err) {
      console.warn('API error, using demo dataset:', err);
      setAppointments(DEMO_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (apt.resident_name || '').toLowerCase().includes(searchLower) ||
      (apt.service_type || '').toLowerCase().includes(searchLower) ||
      (apt.reference_number || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'Pending').length,
    approved: appointments.filter((a) => a.status === 'Approved').length,
    rejected: appointments.filter((a) => a.status === 'Rejected').length,
  };

  const handleOpenReviewModal = (apt) => {
    setSelectedApt(apt);
    setShowRejectForm(false);
    setRejectionReason('');
    setActionError('');
    setAssignedDoctor(apt.assigned_doctor || 'Dr. Maria Santos, MD');
    setAssignedRoom(apt.assigned_room || 'Consultation Room 1');
  };

  // Decision Handler: APPROVE APPOINTMENT
  const handleApprove = async () => {
    if (!selectedApt) return;

    const updatedObj = {
      ...selectedApt,
      status: 'Approved',
      assigned_doctor: assignedDoctor,
      assigned_room: assignedRoom,
      rejection_reason: '',
    };

    try {
      await axiosClient.put(`/appointments/${selectedApt.id}`, {
        status: 'Approved',
        assigned_doctor: assignedDoctor,
        assigned_room: assignedRoom,
      });
    } catch (e) {
      console.warn('Backend update failed, updating UI state:', e);
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === selectedApt.id ? updatedObj : item))
    );
    setSelectedApt(null);
  };

  // Decision Handler: REJECT REQUEST & ENTER REASON
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setActionError('Please enter a valid rejection reason.');
      return;
    }

    const updatedObj = {
      ...selectedApt,
      status: 'Rejected',
      rejection_reason: rejectionReason,
      assigned_doctor: '',
      assigned_room: '',
    };

    try {
      await axiosClient.put(`/appointments/${selectedApt.id}`, {
        status: 'Rejected',
        rejection_reason: rejectionReason,
      });
    } catch (e) {
      console.warn('Backend update failed, updating UI state:', e);
    }

    setAppointments((prev) =>
      prev.map((item) => (item.id === selectedApt.id ? updatedObj : item))
    );
    setSelectedApt(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-650" />
              <span>Healthcare Staff Workflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Appointment Schedule & Review Panel
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl font-semibold">
              Receive incoming resident appointment requests, inspect clinical visit reasons, update patient records, and approve or reject schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppointments}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Requests */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Requests</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1.5">{stats.total}</h3>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-auto font-medium">Queue volume</p>
          </div>

          {/* Pending Review */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-555 text-slate-500">Pending Review</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1.5">{stats.pending}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-auto font-medium">Requires staff decision</p>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-555 text-slate-500">Approved</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1.5">{stats.approved}</h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-auto font-medium">Schedules assigned</p>
          </div>

          {/* Rejected */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-555 text-slate-500">Rejected</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1.5">{stats.rejected}</h3>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-auto font-medium">Reasons logged</p>
          </div>
        </div>

        {/* Unified Filter & Search Toolbar */}
        <div className="bg-white rounded-xl p-2 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold h-10 md:h-11">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`h-full px-4 rounded-md transition-all duration-200 text-xs font-medium flex items-center justify-center ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 h-10 md:h-11">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resident name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-10 pr-4 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 hover:bg-slate-100/50 focus:bg-white transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Appointments Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Incoming Appointment Schedule Requests ({filteredAppointments.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Flowchart Role: Healthcare Staff</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Loading appointment queue...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No appointment requests found matching filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 text-slate-555 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4 font-semibold align-middle">Reference & Resident</th>
                    <th className="py-3 px-4 font-semibold align-middle">Service Requested</th>
                    <th className="py-3 px-4 font-semibold align-middle">Preferred Schedule</th>
                    <th className="py-3 px-4 font-semibold align-middle">Visit Reason</th>
                    <th className="py-3 px-4 font-semibold align-middle">Status</th>
                    <th className="py-3 px-4 font-semibold align-middle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-4 px-4 align-middle">
                        <div className="font-mono font-bold text-slate-900">{apt.reference_number || `BHC-APT-${String(apt.id).padStart(5, '0')}`}</div>
                        <div className="font-semibold text-slate-800 text-sm mt-0.5">{apt.resident_name || `Resident #${apt.user_id}`}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{apt.contact_number || 'No Contact'}</div>
                      </td>

                      <td className="py-4 px-4 align-middle">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-semibold text-xs ${getServiceTypeStyles(apt.service_type)}`}>
                          {apt.service_type}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-slate-800">
                          {formatSchedule(apt.preferred_date, apt.preferred_time)}
                        </div>
                      </td>

                      <td className="py-4 px-4 align-middle max-w-xs">
                        <p className="truncate text-slate-600 font-medium" title={apt.reason}>{apt.reason || 'No specific complaint logged'}</p>
                      </td>

                      <td className="py-4 px-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'Approved' ? 'bg-emerald-50 text-emerald-705 text-emerald-700 border border-emerald-100' :
                          apt.status === 'Rejected' ? 'bg-rose-50 text-rose-705 text-rose-700 border border-rose-100' :
                          'bg-amber-50 text-amber-705 text-amber-700 border border-amber-100'
                        }`}>
                          {apt.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {apt.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                          {apt.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                          <span>{apt.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(apt)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors duration-150 shadow-sm inline-flex items-center gap-1.5"
                        >
                          <span>Review Request</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ======================================================================= */}
      {/* FLOWCHART MODAL: "Review Appointment Details" -> Decision: Approve?    */}
      {/* ======================================================================= */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Pinned Header */}
            <div className="p-6 sm:px-8 sm:pt-8 border-b border-slate-100 relative">
              <button
                onClick={() => setSelectedApt(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-850 font-extrabold rounded-full text-[10px] uppercase tracking-wider border border-indigo-200">
                  Flowchart Step: Review Appointment Details
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                Review Appointment Schedule
              </h2>

              <p className="text-slate-500 text-xs">
                Ref: <span className="font-mono font-bold text-slate-800">{selectedApt.reference_number || `BHC-APT-${selectedApt.id}`}</span>
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:px-8 overflow-y-auto flex-1 space-y-5">
              
              {/* Resident Profile Details Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Resident Name:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedApt.resident_name || `User #${selectedApt.user_id}`}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-extrabold text-emerald-700">{selectedApt.service_type}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Requested Schedule:</span>
                  <span className="font-bold text-slate-800">{selectedApt.preferred_date} at {selectedApt.preferred_time}</span>
                </div>

                <div>
                  <span className="text-slate-500">Visit Reason / Chief Complaint:</span>
                  <p className="text-slate-800 font-medium text-xs mt-1 p-3 bg-white rounded-xl border border-slate-200 italic">
                    "{selectedApt.reason || 'No description provided.'}"
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Input details inside the scrollable view */}
              {!showRejectForm && (
                <div className="space-y-3 pt-2">
                  {/* Doctor & Room Assignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Assign Physician / Staff
                      </label>
                      <input
                        type="text"
                        value={assignedDoctor}
                        onChange={(e) => setAssignedDoctor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-350 text-sm focus:outline-none focus:border-indigo-650 bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Assign Consultation Room
                      </label>
                      <input
                        type="text"
                        value={assignedRoom}
                        onChange={(e) => setAssignedRoom(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-355 text-sm focus:outline-none focus:border-indigo-650 bg-white font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {showRejectForm && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Decision: Reject Request & Log Reason</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enter Reason for Rejection <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Schedule slot fully booked; Duty physician unavailable; Incomplete residency verification documents..."
                      className="w-full p-3.5 rounded-xl border-2 border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-semibold"
                    ></textarea>
                  </div>
                </div>
              )}

            </div>

            {/* Pinned Action Footer */}
            <div className="p-6 sm:px-8 border-t border-slate-200 bg-slate-50">
              {showRejectForm ? (
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 min-h-[48px]"
                  >
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectSubmit}
                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-extrabold rounded-xl shadow transition flex items-center justify-center gap-1.5 min-h-[48px]"
                  >
                    <XCircle className="w-4 h-4 text-white" />
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>APPROVE Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-3.5 px-6 bg-rose-50 border border-rose-350 text-rose-700 hover:bg-rose-100 font-extrabold rounded-xl text-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>REJECT Request</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

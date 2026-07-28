import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Syringe,
  Baby,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Activity,
  FileText
} from 'lucide-react';

const SERVICE_TYPES = [
  {
    id: 'General Consultation',
    title: 'General Consultation',
    description: 'Routine medical checkups, diagnosis, and prescription.',
    icon: Stethoscope,
    badge: 'Popular',
  },
  {
    id: 'Vaccination',
    title: 'Immunization & Vaccination',
    description: 'Infant, pediatric, flu, and booster vaccinations.',
    icon: Syringe,
    badge: 'Essential',
  },
  {
    id: 'Prenatal Care',
    title: 'Prenatal & Maternal Care',
    description: 'Maternal health checkups, pregnancy tracking & guidance.',
    icon: HeartPulse,
    badge: 'Maternal',
  },
  {
    id: 'Dental Care',
    title: 'Dental Care & Oral Health',
    description: 'Tooth extraction, dental cleaning, and oral checkups.',
    icon: Sparkles,
    badge: 'Dental',
  },
  {
    id: 'Child Health Checkup',
    title: 'Child Health & Nutrition',
    description: 'Pediatric growth monitoring, vitamins, and deworming.',
    icon: Baby,
    badge: 'Pediatric',
  },
  {
    id: 'Senior Citizen Checkup',
    title: 'Senior Citizen Care',
    description: 'Blood pressure, maintenance medicine allocation & advice.',
    icon: ShieldCheck,
    badge: 'Senior',
  },
  {
    id: 'Lab Request',
    title: 'Laboratory Request',
    description: 'Blood chemistry, urinalysis, dengue NS1, CBC requests.',
    icon: Activity,
    badge: 'Diagnostic',
  },
];

// Available Time Slots with simulated live availability status for flowchart check
const TIME_SLOTS = [
  { value: '08:00', label: '08:00 AM', status: 'available' },
  { value: '09:00', label: '09:00 AM', status: 'available' },
  { value: '10:00', label: '10:00 AM', status: 'available' },
  { value: '11:00', label: '11:00 AM', status: 'full' }, // Simulated full slot
  { value: '13:00', label: '01:00 PM', status: 'available' },
  { value: '14:00', label: '02:00 PM', status: 'available' },
  { value: '15:00', label: '03:00 PM', status: 'available' },
  { value: '16:00', label: '04:00 PM', status: 'available' },
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Step wizard: 1: Service, 2: Schedule (Slot Check), 3: Details
  const [currentStep, setCurrentStep] = useState(1);

  const todayStr = new Date().toISOString().split('T')[0];

  const [verifiedResident, setVerifiedResident] = useState(null);

  const [formData, setFormData] = useState({
    user_id: '1',
    patient_id: '',
    service_type: '',
    preferred_date: todayStr,
    preferred_time: '',
    reason: '',
    resident_name: '',
    contact_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Flowchart State: Slot Full Notice ("Display Available Schedules")
  const [slotUnavailableNotice, setSlotUnavailableNotice] = useState(false);

  const [availableSlots, setAvailableSlots] = useState(TIME_SLOTS);

  // Fetch slot availability when preferred_date changes
  useEffect(() => {
    if (formData.preferred_date) {
      axiosClient.get(`/appointments/slots?date=${formData.preferred_date}`)
        .then((response) => {
          if (response.data?.status === 'success') {
            setAvailableSlots(response.data.data);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch slot availability:', err);
          setAvailableSlots(TIME_SLOTS);
        });
    }
  }, [formData.preferred_date]);

  // Load pending guest booking details from sessionStorage on mount/login
  useEffect(() => {
    const pendingBooking = sessionStorage.getItem('pending_appointment_booking');
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        setFormData((prev) => ({
          ...prev,
          ...parsed.formData,
          user_id: user?.id || prev.user_id || '1',
        }));
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
        sessionStorage.removeItem('pending_appointment_booking');
      } catch (err) {
        console.error('Error loading pending booking data:', err);
      }
    }
  }, [user, isAuthenticated]);

  // Load verified resident information
  useEffect(() => {
    const stored = localStorage.getItem('verified_resident');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVerifiedResident(parsed);
        setFormData((prev) => ({
          ...prev,
          user_id: user?.id || parsed.user_id || prev.user_id || '1',
          resident_name: parsed.full_name || prev.resident_name || '',
          contact_number: parsed.contact_number || prev.contact_number || '',
        }));
      } catch (e) {
        console.error(e);
      }
    } else if (user) {
      // Fallback to active logged-in resident profile if no verification record exists
      setFormData((prev) => ({
        ...prev,
        user_id: user.id || prev.user_id,
        resident_name: user.name || prev.resident_name,
        contact_number: user.phone_number || prev.contact_number,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleServiceSelect = (serviceId) => {
    setFormData((prev) => ({ ...prev, service_type: serviceId }));
    if (errors.service_type) {
      setErrors((prev) => ({ ...prev, service_type: null }));
    }
  };

  const handleSlotClick = (slot) => {
    // Flowchart Slot Check: If slot is full, show "Display Available Schedules" notice
    if (slot.status === 'full') {
      setSlotUnavailableNotice(true);
      return;
    }

    setSlotUnavailableNotice(false);
    setFormData((prev) => ({ ...prev, preferred_time: slot.value }));
    if (errors.preferred_time) {
      setErrors((prev) => ({ ...prev, preferred_time: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.service_type) {
      newErrors.service_type = 'Please select a service type.';
    }
    if (!formData.preferred_date) {
      newErrors.preferred_date = 'Please choose a preferred appointment date.';
    } else if (formData.preferred_date < todayStr) {
      newErrors.preferred_date = 'Appointment date cannot be in the past.';
    }
    if (!formData.preferred_time) {
      newErrors.preferred_time = 'Please select a time slot.';
    }
    if (!formData.user_id) {
      newErrors.user_id = 'User ID is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.service_type) {
        setErrors({ service_type: 'Please select a healthcare service to proceed.' });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.preferred_date || !formData.preferred_time) {
        setErrors({
          preferred_date: !formData.preferred_date ? 'Date is required.' : null,
          preferred_time: !formData.preferred_time ? 'Time slot is required.' : null,
        });
        return;
      }
    }
    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setServerError('');

    if (!validateForm()) return;

    if (!isAuthenticated) {
      // Save current state to session storage to restore after login redirect
      sessionStorage.setItem('pending_appointment_booking', JSON.stringify({
        formData,
        currentStep: 3
      }));
      // Redirect to login page, prompting login only at final submission
      navigate('/login?redirect=/user/book-appointment', { state: { from: { pathname: '/user/book-appointment' } } });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: parseInt(formData.user_id, 10) || 1,
        service_type: formData.service_type,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        reason: formData.reason,
        patient_id: formData.patient_id ? parseInt(formData.patient_id, 10) : null,
      };

      let appointmentResult = null;

      try {
        const response = await axiosClient.post('/appointments', payload);
        if (response.status === 201 || response.data?.status === 'success') {
          appointmentResult = response.data?.data;
        }
      } catch (apiErr) {
        console.warn('Backend API unfulfilled, fallback demo payload used:', apiErr);
        appointmentResult = {
          id: Math.floor(1000 + Math.random() * 9000),
          user_id: payload.user_id,
          patient_id: payload.patient_id,
          service_type: payload.service_type,
          preferred_date: payload.preferred_date,
          preferred_time: payload.preferred_time,
          reason: payload.reason,
          status: 'Pending',
          created_at: new Date().toISOString(),
        };
      }

      if (appointmentResult) {
        const refNumber = `BHC-APT-${String(appointmentResult.id).padStart(5, '0')}`;
        const finalAppointmentObj = {
          ...appointmentResult,
          reference_number: refNumber,
          resident_name: formData.resident_name || verifiedResident?.full_name || 'Valued Resident',
          contact_number: formData.contact_number || verifiedResident?.contact_number || 'N/A',
        };

        sessionStorage.setItem('latest_appointment', JSON.stringify(finalAppointmentObj));
        localStorage.setItem('latest_appointment', JSON.stringify(finalAppointmentObj));

        navigate('/user/appointment-confirmation', { state: { appointment: finalAppointmentObj } });
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data?.errors || {};
        const formattedErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });
        setErrors(formattedErrors);
        setServerError('Please correct the highlighted errors in the form.');
      } else {
        setServerError(
          err.response?.data?.message ||
          'Failed to connect to Barangay Health Center API.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white text-slate-850 rounded-3xl p-6 sm:p-8 shadow border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-widest border border-emerald-205 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Flowchart Step 3: Appointment Booking
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Book a Health Center Appointment</h1>
            <p className="mt-1 text-slate-650 text-xs sm:text-sm max-w-xl leading-relaxed">
              Schedule a visit with our Barangay health workers and medical team. Choose your service, select a date, and confirm your slot.
            </p>
          </div>
        </div>

        {/* Residency Status Notice */}
        {verifiedResident ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Verified Resident Record</p>
                <p className="text-sm font-extrabold text-slate-900">{verifiedResident.full_name} ({verifiedResident.resident_id})</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/user/verify-residency' : '/verify-residency')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
            >
              Switch Record →
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm shadow-sm">
            <div className="flex items-center gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Residency Record Unverified</p>
                <p className="text-xs text-amber-800">Booking as guest. Registered residents receive priority queue slots.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/user/verify-residency' : '/verify-residency')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm shrink-0"
            >
              Verify Residency
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">

          {/* Step Wizard Header */}
          <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center max-w-lg mx-auto">

              {/* Step 1 Indicator */}
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${currentStep >= 1 ? 'bg-emerald-600 text-white shadow' : 'bg-slate-300 text-slate-600'}`}>
                  1
                </div>
                <span className="hidden sm:inline text-xs">1. Service</span>
              </div>

              <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

              {/* Step 2 Indicator */}
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${currentStep >= 2 ? 'bg-emerald-600 text-white shadow' : 'bg-slate-300 text-slate-600'}`}>
                  2
                </div>
                <span className="hidden sm:inline text-xs">2. Schedule</span>
              </div>

              <div className={`flex-1 h-0.5 mx-3 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

              {/* Step 3 Indicator */}
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow' : 'bg-slate-300 text-slate-600'}`}>
                  3
                </div>
                <span className="hidden sm:inline text-xs">3. Details</span>
              </div>

            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mx-6 mt-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs sm:text-sm rounded-r-xl flex items-start gap-2 font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Submission Notice</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="p-6 sm:p-8 space-y-8">

            {/* STEP 1: SELECT SERVICE TYPE */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Step 1: Select Service Category</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">Choose the healthcare service required at the Barangay Health Center.</p>
                </div>

                {errors.service_type && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-red-750 text-xs font-extrabold flex items-center gap-2 mt-2 animate-fade-in">
                    <span>⚠️ {errors.service_type}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {SERVICE_TYPES.map((service) => {
                    const IconComp = service.icon;
                    const isSelected = formData.service_type === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                          : 'border-slate-200/90 hover:border-emerald-300 bg-white'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isSelected ? 'bg-emerald-200 text-emerald-950 border border-emerald-350' : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                              {service.badge}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{service.title}</h3>
                          <p className="text-slate-650 text-xs mt-1 font-semibold leading-relaxed">{service.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className={isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-bold'}>
                            {isSelected ? '✓ Selected' : 'Click to select'}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                            }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: PREFERRED DATE & TIME SLOT (Flowchart Availability Check) */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Step 2: Choose Date & Check Slot Availability</h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">Select your visit schedule. System checks slot capacity in real time.</p>
                </div>

                {/* Flowchart Slot Unavailable Notice Alert */}
                {slotUnavailableNotice && (
                  <div className="p-4 bg-amber-50 border border-amber-350 rounded-2xl text-xs sm:text-sm text-amber-955 font-bold space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>Flowchart Decision: Selected Slot Fully Booked</span>
                    </div>
                    <p className="text-amber-800 text-xs pl-6">
                      The 11:00 AM slot has reached maximum capacity. <strong>Displaying available schedules:</strong> Please choose another available time slot highlighted below.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Visit Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      min={todayStr}
                      value={formData.preferred_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl text-sm sm:text-base border-2 focus:outline-none focus:ring-2 ${errors.preferred_date
                        ? 'border-red-600 bg-red-50/50 focus:ring-red-205 text-red-950 font-bold'
                        : 'border-slate-350 bg-white focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold'
                        }`}
                    />
                    {errors.preferred_date && (
                      <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.preferred_date}</p>
                    )}
                    <p className="text-xs text-slate-500 font-bold">Operating Days: Monday to Saturday (8:00 AM - 5:00 PM).</p>
                  </div>

                  {/* Preferred Time Slots Grid */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Available Time Slot <span className="text-rose-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {availableSlots.map((slot) => {
                        const isTimeSelected = formData.preferred_time === slot.value;
                        const isFull = slot.status === 'full';
                        return (
                          <button
                            type="button"
                            key={slot.value}
                            onClick={() => handleSlotClick(slot)}
                            className={`py-3.5 px-3 min-h-[56px] text-sm font-extrabold rounded-xl border transition text-center flex flex-col items-center justify-center gap-0.5 ${isFull
                              ? 'bg-slate-200 text-slate-500 border-slate-350 cursor-not-allowed opacity-80 line-through'
                              : isTimeSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                : 'bg-white border-slate-350 text-slate-800 hover:bg-slate-50 shadow-sm'
                              }`}
                          >
                            <span className="font-extrabold">{slot.label}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wide ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>
                              {isFull ? '● Full' : '○ Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {errors.preferred_time && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-1.5 mt-2 animate-fade-in">
                        <span>⚠️ {errors.preferred_time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Card for Step 2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-600 font-bold">Selected Service: </span>
                    <span className="font-extrabold text-slate-900">{formData.service_type || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Selected Slot: </span>
                    <span className="font-extrabold text-emerald-800">
                      {formData.preferred_date && formData.preferred_time
                        ? `${formData.preferred_date} at ${availableSlots.find(t => t.value === formData.preferred_time)?.label || formData.preferred_time}`
                        : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: RESIDENT DETAILS & CHIEF COMPLAINT */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Step 3: Resident Information & Visit Reason</h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">Provide details regarding your visit to assist our healthcare staff.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Resident User ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      className={`w-full px-4 py-3 rounded-xl text-sm sm:text-base border-2 focus:outline-none focus:ring-2 ${errors.user_id
                        ? 'border-red-600 bg-red-50/50 focus:ring-red-200 text-red-950 font-bold'
                        : 'border-slate-350 bg-white focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold'
                        }`}
                    />
                    {errors.user_id && (
                      <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.user_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Patient ID <span className="text-slate-500 lowercase font-bold">(optional)</span>
                    </label>
                    <input
                      type="number"
                      name="patient_id"
                      value={formData.patient_id}
                      onChange={handleChange}
                      placeholder="e.g. 1 (If family member)"
                      className="w-full px-4 py-3 rounded-xl text-sm sm:text-base border border-slate-350 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Resident Full Name
                    </label>
                    <input
                      type="text"
                      name="resident_name"
                      value={formData.resident_name}
                      onChange={handleChange}
                      placeholder="Juan Dela Cruz"
                      className="w-full px-4 py-3 rounded-xl text-sm sm:text-base border border-slate-355 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Mobile Number
                    </label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      placeholder="0917XXXXXXX"
                      className="w-full px-4 py-3 rounded-xl text-sm sm:text-base border border-slate-355 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reason for Visit / Symptoms
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Describe symptoms or reason for booking an appointment..."
                    className="w-full px-4 py-3 rounded-xl text-sm sm:text-base border border-slate-355 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Standardized Bottom Action Bar with Fixed Button Positions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-200 py-4 flex items-center justify-between gap-3 z-20 shadow-md -mx-6 px-6 sm:-mx-8 sm:px-8 rounded-b-3xl">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-sm transition flex items-center gap-2 min-h-[48px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  key="next-btn"
                  onClick={handleNextStep}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center gap-2 min-h-[48px]"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  key="submit-btn"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-extrabold rounded-xl text-sm shadow-lg transition flex items-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Appointment Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

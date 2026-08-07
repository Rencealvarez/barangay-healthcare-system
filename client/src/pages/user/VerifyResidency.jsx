import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  HelpCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Building2,
  QrCode,
  Calendar,
  User,
  IdCard,
  Eye,
  EyeOff
} from 'lucide-react';

export default function VerifyResidency() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialAnswer = queryParams.get('mode') === 'register' ? 'no' : null;

  const { isAuthenticated, login, refreshUser, user } = useAuth();

  // Decision State: "do you have a barangay residency record?"
  // Options: null (question pending), 'yes' (verify form), 'no' (register form)
  const [residencyAnswer, setResidencyAnswer] = useState(initialAnswer);

  // Success view state
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState(null);

  const activeResident = user?.resident || verifiedDetails;
  const isResidencyVerified = !!user?.resident || (verificationSuccess && verifiedDetails);

  // Form states
  const [lookupData, setLookupData] = useState({
    resident_id: '',
    full_name: '',
    date_of_birth: '',
    purok_zone: 'Zone 1',
  });

  const [registerData, setRegisterData] = useState({
    full_name: '',
    gender: 'Male',
    date_of_birth: '',
    civil_status: 'Single',
    zone_purok: 'Zone 1',
    address: '',
    mobile_number: '',
    email: '',
    password: '',
    id_type: 'Barangay ID',
    id_reference_number: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showNotFoundBanner, setShowNotFoundBanner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isCustomPurokActive, setIsCustomPurokActive] = useState(false);

  const defaultZones = [
    'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7',
    'Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'
  ];
  const showCustomInput = isCustomPurokActive || (registerData.zone_purok && !defaultZones.includes(registerData.zone_purok));

  const handleLookupChange = (e) => {
    const { name, value } = e.target;
    setLookupData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (showNotFoundBanner) setShowNotFoundBanner(false);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    let cleanedValue = value;

    if (name === 'full_name') {
      cleanedValue = value.replace(/[^a-zA-Z\s.\-']/g, '');
    } else if (name === 'mobile_number') {
      cleanedValue = value.replace(/[^0-9]/g, '');
      if (cleanedValue.length > 11) return;
    } else if (name === 'email') {
      cleanedValue = value.toLowerCase();
    } else if (name === 'id_reference_number') {
      cleanedValue = value.toUpperCase().replace(/\s/g, '');
    } else if (name === 'zone_purok') {
      if (value === 'Other') {
        setIsCustomPurokActive(true);
        cleanedValue = '';
      } else {
        setIsCustomPurokActive(false);
      }
    }

    setRegisterData((prev) => ({ ...prev, [name]: cleanedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Submit Handler: VERIFY EXISTING RESIDENT RECORD ("If Yes")
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setShowNotFoundBanner(false);
    setFeedback(null);

    const newErrors = {};
    if (!lookupData.full_name) newErrors.full_name = 'Full Name is required.';
    if (!lookupData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post('/residency/lookup', {
        full_name: lookupData.full_name,
        date_of_birth: lookupData.date_of_birth,
      });

      if (response.data?.status === 'success') {
        const verifiedResident = response.data.data;
        localStorage.setItem('verified_resident', JSON.stringify(verifiedResident));

        setFeedback({
          type: 'success',
          message: `Residency Record Verified! Welcome back, ${verifiedResident.full_name}.`,
        });

        if (isAuthenticated && refreshUser) {
          await refreshUser();
        }

        setVerifiedDetails(verifiedResident);
        setVerificationSuccess(true);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setShowNotFoundBanner(true);
      } else {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to verify residency record. Please try again or register.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: REGISTER NEW RESIDENCY RECORD ("If No")
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFeedback(null);

    const newErrors = {};

    // FULL NAME: Required, min 2 chars, max 100 chars. Must contain at least two words. Auto-trim whitespace.
    const trimmedName = registerData.full_name.trim();
    if (!trimmedName) {
      newErrors.full_name = 'Full Name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.full_name = 'Full Name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.full_name = 'Full Name must not exceed 100 characters.';
    } else if (trimmedName.split(/\s+/).filter(Boolean).length < 2) {
      newErrors.full_name = 'Full Name must contain at least two words (First Name and Last Name).';
    }

    // GENDER
    if (!registerData.gender) {
      newErrors.gender = 'Gender is required.';
    }

    // DATE OF BIRTH: Required, min 120 years ago, max today, must be at least 15 years old
    if (!registerData.date_of_birth) {
      newErrors.date_of_birth = 'Date of Birth is required.';
    } else {
      const dob = new Date(registerData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const minDate = new Date('1906-01-01');
      if (dob < minDate) {
        newErrors.date_of_birth = 'Date of birth cannot be more than 120 years ago.';
      } else if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future.';
      } else if (age < 15) {
        newErrors.date_of_birth = 'You must be at least 15 years old to register.';
      }
    }

    // CIVIL STATUS
    if (!registerData.civil_status) {
      newErrors.civil_status = 'Civil Status is required.';
    }

    // COMPLETE HOUSE ADDRESS: Required, min 5 chars, max 250 chars. Block entirely repetitive characters.
    const trimmedAddress = registerData.address.trim();
    if (!trimmedAddress) {
      newErrors.address = 'Complete House Address is required.';
    } else if (trimmedAddress.length < 5) {
      newErrors.address = 'Address must be at least 5 characters.';
    } else if (trimmedAddress.length > 250) {
      newErrors.address = 'Address must not exceed 250 characters.';
    } else {
      const addressAlphanum = trimmedAddress.replace(/[^a-zA-Z0-9]/g, '');
      const uniqueChars = new Set(addressAlphanum.toLowerCase());
      if (uniqueChars.size <= 2 && addressAlphanum.length >= 5) {
        newErrors.address = 'Address cannot consist of entirely repetitive characters.';
      }
    }

    // BARANGAY ZONE / PUROK
    if (!registerData.zone_purok) {
      newErrors.zone_purok = 'Barangay Zone / Purok is required.';
    }

    // MOBILE / CONTACT NUMBER: Must start with 09 and be exactly 11 digits long
    if (!registerData.mobile_number) {
      newErrors.mobile_number = 'Mobile Number is required.';
    } else if (!/^09\d{9}$/.test(registerData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number must start with 09 and be exactly 11 digits.';
    }

    // EMAIL ADDRESS: Required, standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = registerData.email.trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // ACCOUNT PASSWORD: Required, min 8 chars, max 64 chars, 1 uppercase, 1 lowercase, 1 number
    const password = registerData.password;
    if (!password) {
      newErrors.password = 'Account Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (password.length > 64) {
      newErrors.password = 'Password must not exceed 64 characters.';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.';
    }

    // GOVERNMENT / VALID ID TYPE
    if (!registerData.id_type) {
      newErrors.id_type = 'Government / Valid ID Type is required.';
    }

    // ID REFERENCE NUMBER: Required, min 5, max 30, alphanumeric
    const cleanIdRef = registerData.id_reference_number;
    if (!cleanIdRef) {
      newErrors.id_reference_number = 'ID Reference Number is required.';
    } else if (cleanIdRef.length < 5) {
      newErrors.id_reference_number = 'ID Reference Number must be at least 5 characters.';
    } else if (cleanIdRef.length > 30) {
      newErrors.id_reference_number = 'ID Reference Number must not exceed 30 characters.';
    } else if (!/^[A-Z0-9]+$/.test(cleanIdRef)) {
      newErrors.id_reference_number = 'ID Reference Number must contain only alphanumeric characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post('/residency/register', {
        full_name: trimmedName,
        gender: registerData.gender,
        date_of_birth: registerData.date_of_birth,
        civil_status: registerData.civil_status,
        zone_purok: registerData.zone_purok,
        address: trimmedAddress,
        mobile_number: registerData.mobile_number,
        email: cleanEmail,
        password: registerData.password,
        id_type: registerData.id_type,
        id_reference_number: cleanIdRef,
      });

      if (response.data?.status === 'success' || response.status === 201) {
        const newResidentRecord = response.data.data;
        localStorage.setItem('verified_resident', JSON.stringify(newResidentRecord));

        // Auto-login user if account password was supplied
        if (cleanEmail && registerData.password) {
          const loginRes = await login({
            email: cleanEmail,
            password: registerData.password,
          });
          if (loginRes.success) {
            console.log('Auto-logged in registered resident.');
          }
        }

        setFeedback({
          type: 'success',
          message: `Residency Record Created Successfully! ID: ${newResidentRecord.resident_id}. Account created and logged in!`,
        });

        setVerifiedDetails(newResidentRecord);
        setVerificationSuccess(true);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          backendErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(backendErrors);
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Please correct the highlighted errors.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to register residency. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Success view state rendering
  if (isResidencyVerified && activeResident) {
    const dobString = activeResident.date_of_birth
      ? (typeof activeResident.date_of_birth === 'string' ? activeResident.date_of_birth.split('T')[0] : '')
      : '';

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

          {/* Success Banner */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>

            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 border border-emerald-250 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Residency Status Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                Barangay Residency Record Confirmed!
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mt-2 leading-relaxed font-semibold">
                Your profile has been validated. You are eligible for priority health center services, maintenance medicine allocations, and medical consultations.
              </p>
            </div>

            {/* Resident Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left relative">
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-200 gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">Official Barangay Resident ID</span>
                  <div className="text-xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
                    {activeResident.resident_id}
                  </div>
                </div>
                <div className="self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activeResident.status || 'Verified Resident'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Resident Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{activeResident.full_name}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Barangay Zone / Purok</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{activeResident.purok_zone}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Date of Birth</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{dobString}</span>
                </div>

                <div>
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Contact Number</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{activeResident.contact_number || 'N/A'}</span>
                </div>
              </div>

              {/* Mock QR Pass */}
              <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold font-mono">Resident Digital Identity Pass</p>
                  <p className="text-[10px] font-mono font-bold text-emerald-700">VALID AND REGISTERED IN DISTRICT DATABASE</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl text-slate-800 flex items-center gap-1.5 font-mono text-xs font-extrabold border border-slate-300 shadow-xs">
                  <QrCode className="w-5 h-5 text-slate-800" />
                  <span className="text-[10px]">QR IDENTITY</span>
                </div>
              </div>
            </div>

            {/* Direct Action Callout */}
            <div className="p-4 bg-teal-50 border border-teal-205 rounded-2xl text-left flex items-start gap-3 text-xs sm:text-sm text-teal-900">
              <span className="text-lg mt-0.5">ℹ️</span>
              <div>
                <p className="font-extrabold text-teal-955">What's Next?</p>
                <p className="text-teal-900 text-xs mt-0.5 leading-relaxed font-semibold">
                  Now that your residency is confirmed, you can proceed directly to reserve your clinical checkup or consultation appointment.
                </p>
              </div>
            </div>

            {/* Actions */}
            {!user?.resident && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSuccess(false);
                    setVerifiedDetails(null);
                    setResidencyAnswer(null);
                    setFeedback(null);
                  }}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition flex items-center justify-center min-h-[48px] sm:w-auto w-full border border-slate-300 transform active:scale-95"
                >
                  Start Over / Switch Profile
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-teal-500/5 blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-extrabold uppercase tracking-widest border border-teal-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Flowchart Step 2: Residency Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Barangay Residency Check & Registration</h1>
            <p className="mt-1 text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Healthcare services and priority appointment slots are allocated for verified Barangay residents.
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>{feedback.message}</div>
          </div>
        )}


        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 text-center animate-fade-in space-y-6">

          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-teal-200 shadow-sm">
            <HelpCircle className="w-8 h-8 text-teal-600" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Residency Decision Point
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
              Do you have an existing Barangay Residency Record?
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              If you have already registered with the Barangay Hall or previously availed of health center services, select <strong>YES</strong>. Otherwise, select <strong>NO</strong> to create your residency profile.
            </p>
          </div>

          {/* Decision Cards with fixed button styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">

            {/* Decision: YES */}
            <button
              type="button"
              onClick={() => setResidencyAnswer('yes')}
              className="p-6 bg-slate-50 hover:bg-emerald-50/80 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl transition-all duration-200 text-left group flex flex-col justify-between shadow-sm hover:shadow-md min-h-[160px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700">
                  YES, I Have a Record
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">
                  I am a registered resident. Proceed to record lookup & verification.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-bold text-emerald-600 flex items-center justify-between">
                <span>Verify Record</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Decision: NO */}
            <button
              type="button"
              onClick={() => setResidencyAnswer('no')}
              className="p-6 bg-slate-50 hover:bg-teal-50/80 border-2 border-slate-200 hover:border-teal-500 rounded-2xl transition-all duration-200 text-left group flex flex-col justify-between shadow-sm hover:shadow-md min-h-[160px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700">
                  NO, I Need to Register
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">
                  I am a new resident or first-time visitor. Fill out the quick registration form.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-bold text-teal-600 flex items-center justify-between">
                <span>Register Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>

        {residencyAnswer === 'yes' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-fade-in">

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Option A: Resident Lookup
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Verify Your Barangay Record</h2>
              </div>
              <button
                type="button"
                onClick={() => setResidencyAnswer(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition min-h-[38px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Switch Option
              </button>
            </div>

            {showNotFoundBanner && (
              <div className="mb-6 p-5 bg-amber-50 border border-amber-300 rounded-2xl animate-fade-in space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 text-amber-600">⚠️</span>
                  <div>
                    <h3 className="font-extrabold text-amber-900 text-sm">Residency Record Not Found</h3>
                    <p className="text-amber-800 text-xs mt-1 leading-relaxed font-semibold">
                      We couldn't locate an official residency profile matching <strong className="text-slate-900">"{lookupData.full_name}"</strong> with a date of birth of <strong className="text-slate-900">{lookupData.date_of_birth}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterData(prev => ({
                        ...prev,
                        full_name: lookupData.full_name,
                        date_of_birth: lookupData.date_of_birth
                      }));
                      setResidencyAnswer('no');
                      setShowNotFoundBanner(false);
                    }}
                    className="px-4 py-2 bg-amber-650 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition transform active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Register as New Resident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name spans full width */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Resident Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 pointer-events-none">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="full_name"
                      value={lookupData.full_name}
                      onChange={handleLookupChange}
                      placeholder="e.g. Juan Dela Cruz"
                      className={`w-full h-12 pl-11 pr-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.full_name ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5 ml-1">
                    Enter name as stated on official Barangay records
                  </p>
                  {errors.full_name && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.full_name}</p>}
                </div>

                {/* Date of Birth & Barangay Zone */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 pointer-events-none">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={lookupData.date_of_birth}
                      onChange={handleLookupChange}
                      className={`w-full h-12 pl-11 pr-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.date_of_birth ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                  </div>
                  {errors.date_of_birth && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.date_of_birth}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Barangay Zone / Purok
                  </label>
                  <select
                    name="purok_zone"
                    value={lookupData.purok_zone}
                    onChange={handleLookupChange}
                    className="w-full h-12 py-0 pl-4 pr-10 rounded-xl text-sm sm:text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-semibold text-slate-800 transition appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat"
                  >
                    <option value="Zone 1">Zone 1 (Poblacion)</option>
                    <option value="Zone 2">Zone 2 (Riverside)</option>
                    <option value="Zone 3">Zone 3 (Hilltop)</option>
                    <option value="Zone 4">Zone 4 (Eastside)</option>
                    <option value="Zone 5">Zone 5 (Westside)</option>
                  </select>
                </div>

                {/* ID Number spans full width */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Barangay Resident ID Number <span className="text-slate-500 text-xs lowercase font-bold">(optional if known)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 pointer-events-none">
                      <IdCard className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="resident_id"
                      value={lookupData.resident_id}
                      onChange={handleLookupChange}
                      placeholder="e.g. BRG-2026-9912"
                      className="w-full h-12 pl-11 pr-4 rounded-xl text-sm sm:text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-semibold text-slate-800 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Standardized Bottom Action Bar with Fixed Button Positions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResidencyAnswer(null)}
                  className="px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-sm transition flex items-center gap-2 transform active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center gap-2 transform active:scale-95"
                >
                  {loading ? 'Verifying Record...' : 'Verify Record & Proceed'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* IF NO: REGISTER BARANGAY RESIDENCY RECORD FORM                          */}
        {/* ======================================================================= */}
        {residencyAnswer === 'no' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-fade-in">

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Option B: First-Time Registration
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Register Barangay Residency Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setResidencyAnswer(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition min-h-[38px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Switch Option
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1: Full Name & Gender */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={registerData.full_name}
                    onChange={handleRegisterChange}
                    placeholder="First Name, Middle Name, Last Name"
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.full_name ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.full_name && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={registerData.gender}
                    onChange={handleRegisterChange}
                    className={`w-full h-12 py-0 pl-4 pr-10 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat ${errors.gender ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.gender}</p>}
                </div>

                {/* Row 2: Date of Birth & Civil Status */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={registerData.date_of_birth}
                    onChange={handleRegisterChange}
                    min="1906-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.date_of_birth ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.date_of_birth && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.date_of_birth}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Civil Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="civil_status"
                    value={registerData.civil_status}
                    onChange={handleRegisterChange}
                    className={`w-full h-12 py-0 pl-4 pr-10 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat ${errors.civil_status ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                  {errors.civil_status && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.civil_status}</p>}
                </div>

                {/* Row 3: Complete House Address (span-2) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Complete House Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={registerData.address}
                    onChange={handleRegisterChange}
                    placeholder="House No., Street Name"
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.address ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.address && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.address}</p>}
                </div>

                {/* Row 4: Purok/Zone & Mobile/Contact Number */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Barangay Zone / Purok <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="zone_purok"
                    value={defaultZones.includes(registerData.zone_purok) ? registerData.zone_purok : 'Other'}
                    onChange={handleRegisterChange}
                    className={`w-full h-12 py-0 pl-4 pr-10 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat ${errors.zone_purok ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  >
                    <option value="Zone 1">Zone 1</option>
                    <option value="Zone 2">Zone 2</option>
                    <option value="Zone 3">Zone 3</option>
                    <option value="Zone 4">Zone 4</option>
                    <option value="Zone 5">Zone 5</option>
                    <option value="Zone 6">Zone 6</option>
                    <option value="Zone 7">Zone 7</option>
                    <option value="Purok 1">Purok 1</option>
                    <option value="Purok 2">Purok 2</option>
                    <option value="Purok 3">Purok 3</option>
                    <option value="Purok 4">Purok 4</option>
                    <option value="Purok 5">Purok 5</option>
                    <option value="Purok 6">Purok 6</option>
                    <option value="Other">Other (Type custom...)</option>
                  </select>
                  {showCustomInput && (
                    <input
                      type="text"
                      name="zone_purok"
                      value={registerData.zone_purok}
                      onChange={handleRegisterChange}
                      placeholder="Type custom Zone or Purok (e.g. Purok 7)"
                      className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition mt-2.5 ${errors.zone_purok ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                  )}
                  {errors.zone_purok && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.zone_purok}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Mobile / Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={registerData.mobile_number}
                    onChange={handleRegisterChange}
                    placeholder="0917XXXXXXX"
                    maxLength={11}
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.mobile_number ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.mobile_number && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.mobile_number}</p>}
                </div>

                {/* Row 5: Email Address & Account Password */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="email@gmail.com"
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.email ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.email && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Account Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Min 8 chars, 1 upper, 1 lower, 1 num"
                      className={`w-full h-12 pl-4 pr-12 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.password ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.password}</p>}
                </div>

                {/* Row 6: ID Type & ID Reference Number */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    Government / Valid ID Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="id_type"
                    value={registerData.id_type}
                    onChange={handleRegisterChange}
                    className={`w-full h-12 py-0 pl-4 pr-10 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat ${errors.id_type ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  >
                    <option value="Barangay ID">Barangay ID</option>
                    <option value="PhilHealth ID">PhilHealth ID</option>
                    <option value="SSS / GSIS ID">SSS / GSIS ID</option>
                    <option value="National ID (PhilSys)">National ID (PhilSys)</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter's ID">Voter's ID</option>
                  </select>
                  {errors.id_type && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.id_type}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-2">
                    ID Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="id_reference_number"
                    value={registerData.id_reference_number}
                    onChange={handleRegisterChange}
                    placeholder="e.g. PRN-12345"
                    className={`w-full h-12 px-4 rounded-xl text-sm sm:text-base border focus:outline-none focus:ring-2 font-semibold transition ${errors.id_reference_number ? 'border-red-500 bg-red-50/30 focus:ring-red-200 focus:border-red-500 text-red-950 font-bold' : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                      }`}
                  />
                  {errors.id_reference_number && <p className="text-red-700 text-xs font-bold mt-1.5 animate-fade-in">⚠️ {errors.id_reference_number}</p>}
                </div>
              </div>

              {/* Standardized Bottom Action Bar with Fixed Button Positions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResidencyAnswer(null)}
                  className="px-6 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-sm transition flex items-center gap-2 transform active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 h-12 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center gap-2 transform active:scale-95"
                >
                  {loading ? 'Submitting Profile...' : 'Register Profile & Proceed'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

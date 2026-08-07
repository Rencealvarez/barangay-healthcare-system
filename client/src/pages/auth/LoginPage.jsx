import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, switchRole } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  // Lock modes based on URL parameter
  const isResidentOnlyMode = tabParam === 'resident'; // Sign In button → resident only
  const isStaffOnlyMode = tabParam === 'staff';       // Staff Portal button → staff only

  const initialTab = isStaffOnlyMode ? 'staff' : 'resident';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Sync state when initialTab (derived from URL tab query param) changes
  useEffect(() => {
    setActiveTab(initialTab);
    setEmail('');
    setPassword('');
    setError('');
  }, [initialTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login({ email, password });
    if (res.success) {
      const role = res.user.role;
      const redirectParam = queryParams.get('redirect');
      const fromPath = location.state?.from?.pathname || redirectParam;

      if (role === 'resident') {
        navigate(fromPath || '/user/dashboard', { replace: true });
      } else {
        navigate(fromPath || '/admin/dashboard', { replace: true });
      }
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleQuickDemo = (roleType) => {
    switchRole(roleType);
    const redirectParam = queryParams.get('redirect');
    const fromPath = location.state?.from?.pathname || redirectParam;

    if (roleType === 'resident') {
      navigate(fromPath || '/user/dashboard', { replace: true });
    } else {
      navigate(fromPath || '/admin/dashboard', { replace: true });
    }
  };

  // Determine which demo buttons to show
  const showResidentDemo = !isStaffOnlyMode;
  const showStaffDemo = !isResidentOnlyMode;
  const showAdminDemo = !isResidentOnlyMode;
  const demoColCount = [showResidentDemo, showStaffDemo, showAdminDemo].filter(Boolean).length;

  // Determine whether to show the tab switcher
  const isTabLocked = isResidentOnlyMode || isStaffOnlyMode;

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-250 text-2xl font-bold mb-2">
            {isStaffOnlyMode ? '🩺' : '🏥'}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isStaffOnlyMode ? 'Healthcare Staff Portal' : 'Barangay Health System'}
          </h2>
          <p className="text-sm text-slate-500 font-semibold">
            {isStaffOnlyMode
              ? 'Access is restricted to authorized healthcare personnel only'
              : isResidentOnlyMode
                ? 'Sign in to access your Resident Health Portal'
                : 'Sign in to access your designated healthcare portal'}
          </p>
        </div>

        {/* Quick Demo Role Switcher Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>⚡ DEMO QUICK ACCESS:</span>
            <span className="text-emerald-700">1-Click Portal Switch</span>
          </div>
          <div className={`grid gap-2 grid-cols-${demoColCount}`}>
            {showResidentDemo && (
              <button
                type="button"
                onClick={() => handleQuickDemo('resident')}
                className="px-3 py-2 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-all text-center"
              >
                👤 Resident
              </button>
            )}
            {showStaffDemo && (
              <button
                type="button"
                onClick={() => handleQuickDemo('staff')}
                className="px-3 py-2 text-xs font-extrabold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 transition-all text-center"
              >
                🩺 Staff
              </button>
            )}
            {showAdminDemo && (
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="px-3 py-2 text-xs font-extrabold rounded-lg bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100 transition-all text-center"
              >
                🛡️ Admin
              </button>
            )}
          </div>
        </div>

        {/* Portal Tabs */}
        {!isTabLocked ? (
          /* Normal /login — show both tabs */
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => handleTabChange('resident')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${activeTab === 'resident'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Resident Portal
            </button>
            <button
              onClick={() => handleTabChange('staff')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Staff &amp; Admin Portal
            </button>
          </div>
        ) : isResidentOnlyMode ? (
          /* Resident-only mode: locked resident tab */
          <div className="flex border-b border-emerald-300">
            <div className="flex-1 py-3 text-sm font-extrabold border-b-2 border-emerald-600 text-emerald-700 text-center flex items-center justify-center gap-2">
              🔒 Resident Portal
            </div>
          </div>
        ) : (
          /* Staff-only mode: locked staff tab */
          <div className="flex border-b border-indigo-300">
            <div className="flex-1 py-3 text-sm font-extrabold border-b-2 border-indigo-600 text-indigo-700 text-center flex items-center justify-center gap-2">
              🔒 Staff &amp; Admin Portal
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-bold rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-semibold"
              placeholder={activeTab === 'resident' ? 'Email Address' : 'Email Address'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-semibold"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-base text-white shadow-md transition-all ${activeTab === 'resident'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
              }`}
          >
            Sign In as {activeTab === 'resident' ? 'Barangay Resident' : 'Healthcare Worker'}
          </button>

          {activeTab === 'resident' && (
            <button
              type="button"
              onClick={() => navigate('/verify-residency?mode=register')}
              className="w-full py-3.5 px-6 rounded-xl font-extrabold text-base bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-all text-center shadow-md shadow-emerald-100/10"
            >
              Register
            </button>
          )}
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-extrabold transition-all border border-slate-300"
          >
            ← Return to Public Homepage
          </button>
        </div>

      </div>
    </div>
  );
}

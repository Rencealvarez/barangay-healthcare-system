import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  UserCheck,
  LogOut,
  HeartPulse,
  User
} from 'lucide-react';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', path: '/user/book-appointment', icon: Calendar },
    { label: 'Medical Records', path: '/user/medical-records', icon: FileText },
    { label: 'Residency Status', path: '/user/verify-residency', icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">

      {/* Resident Portal Top Navigation Header */}
      <header className="bg-white text-slate-850 shadow sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand Logo & Portal Name */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <Link to="/user/dashboard" className="text-base font-extrabold text-slate-900 hover:text-emerald-600 transition-colors">
                  Resident Health Portal
                </Link>
                <div className="text-xs text-emerald-600 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Authenticated Resident Account
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const IconComp = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900'
                      }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Badge & Fixed Logout Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-extrabold text-slate-800">
                  {user?.resident?.full_name || user?.name || 'Maria Clara Santos'}
                </div>
                <div className="text-xs font-mono text-slate-500 font-bold">
                  {user?.resident?.resident_id ? `ID: ${user.resident.resident_id}` : 'Unverified Resident'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-rose-600 text-slate-700 hover:text-white border border-slate-300 hover:border-rose-500 transition-all flex items-center gap-1.5 shadow-sm"
                title="Sign out of resident portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

          {/* Mobile subnav */}
          <div className="md:hidden flex overflow-x-auto py-2.5 space-x-2 border-t border-slate-200">
            {navLinks.map((link) => {
              const IconComp = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </header>

      {/* Portal Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

    </div>
  );
}

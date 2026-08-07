import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  UserCheck,
  ShieldCheck,
  LogIn,
  Menu,
  X,
  Stethoscope,
  HeartPulse
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide public global Navbar on dedicated authenticated portal layouts
  if (location.pathname.startsWith('/user') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-800 sticky top-0 z-50 border-b border-slate-200 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo & Portal Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-2">
                BarangayCare <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">Health Portal</span>
              </span>
              <p className="text-xs text-slate-500 font-semibold leading-none mt-1">Barangay Health Services & Appointment System</p>
            </div>
          </Link>

          {/* Desktop Public Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-semibold">
            <Link
              to="/"
              className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${isActive('/')
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>Services & Portal</span>
            </Link>

            <Link
              to={isAuthenticated ? "/user/verify-residency" : "/verify-residency"}
              className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                isActive('/user/verify-residency') || isActive('/verify-residency')
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Residency Check</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-2"></div>

            <Link
              to={isAuthenticated && (role === 'staff' || role === 'admin') ? "/admin/dashboard" : "/login?tab=staff"}
              className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                isActive('/admin/dashboard')
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Staff Portal</span>
            </Link>
          </nav>

          {/* Action Links */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login?tab=resident"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${isActive('/') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Home & Services</span>
          </Link>

          <Link
            to={isAuthenticated ? "/user/verify-residency" : "/verify-residency"}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
              isActive('/user/verify-residency') || isActive('/verify-residency') ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Residency Check</span>
          </Link>

          <Link
            to={isAuthenticated && (role === 'staff' || role === 'admin') ? "/admin/dashboard" : "/login?tab=staff"}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
              isActive('/admin/dashboard') ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Healthcare Staff Portal</span>
          </Link>

          <div className="pt-2">
            <Link
              to="/login?tab=resident"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-emerald-600 text-white flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Portal Account</span>
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}

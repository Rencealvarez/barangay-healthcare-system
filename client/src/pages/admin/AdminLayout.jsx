import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Syringe,
  Users,
  ShieldCheck,
  LogOut,
  Building2
} from 'lucide-react';

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Appointment Management', path: '/admin/dashboard', icon: Calendar },
    { label: 'Health Inventory', path: '/admin/inventory', icon: Syringe },
    { label: 'Resident Patients', path: '/admin/patients', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800 flex font-sans">

      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">

        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-55 bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-650" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 tracking-wide">Barangay Admin</div>
            <div className="text-xs text-indigo-700 font-extrabold uppercase tracking-widest">
              {role === 'admin' ? 'System Administrator' : 'Healthcare Staff'}
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-50/60 border border-slate-200/50 rounded-xl flex items-center space-x-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-55 bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-750 font-bold text-sm shadow-sm ring-2 ring-emerald-500/25 ring-offset-2">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CR'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'Nurse Clara Reyes, RN'}
            </div>
            <div className="text-[11px] text-slate-500 truncate font-medium">
              {user?.email || 'staff@barangay.gov.ph'}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Authenticated Session</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                    ? 'bg-slate-100 text-slate-900 border-l-2 border-indigo-600 rounded-l-none pl-[14px]'
                    : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50 overflow-hidden">

        {/* Top bar header */}
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
            <span>Barangay Health Center Management System</span>
            <span>•</span>
            <span className="text-indigo-700 font-bold">Live Operational Board</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-mono text-xs font-bold">
              Role: {role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5 font-bold" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/user') || location.pathname.startsWith('/admin');

  return (
    <div className={isPortal ? "h-screen overflow-hidden flex flex-col bg-slate-50 font-sans antialiased text-slate-800" : "min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800"}>
      
      {/* Public Global Navigation Header (Hides inside /user/* and /admin/*) */}
      <Navbar />

      {/* Dynamic Route Pages & Authenticated Portals */}
      <main className="flex-1 min-h-0">
        <AppRoutes />
      </main>

      {/* System Footer */}
      {!isPortal && (
        <footer className="bg-slate-100 text-slate-600 text-sm py-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} Barangay Health Services. All rights reserved.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

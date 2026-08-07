import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for Role-Based Access Control (RBAC).
 *
 * Parameters:
 * - allowedRoles: Array of roles allowed to view the child route (e.g. ['resident'] or ['staff', 'admin'])
 * - children: The protected page / component layout
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // 1. Check Authentication Status
  if (!isAuthenticated) {
    let loginPath = '/login';
    if (allowedRoles.includes('resident') && !allowedRoles.includes('staff') && !allowedRoles.includes('admin')) {
      loginPath = '/login?tab=resident';
    } else if ((allowedRoles.includes('staff') || allowedRoles.includes('admin')) && !allowedRoles.includes('resident')) {
      loginPath = '/login?tab=staff';
    }
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Check Role Authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.warn(`[RBAC Protection] Role '${role}' attempted to access route allowed for [${allowedRoles.join(', ')}]`);

    // Redirect to default dashboard based on user's active role
    if (role === 'resident') {
      return <Navigate to="/user/dashboard" replace />;
    } else if (role === 'staff' || role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

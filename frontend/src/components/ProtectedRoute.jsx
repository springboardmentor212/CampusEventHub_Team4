import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getRoleHomeRoute, normalizeRole } from "../utils/roleRoutes";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // DEBUG: Log user role and normalized role for troubleshooting
  if (user) {
    // eslint-disable-next-line no-console
    console.log('[ProtectedRoute] user.role:', user.role, 'normalized:', normalizeRole(user.role));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <span className="text-sm font-semibold">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  const normalizedUserRole = normalizeRole(user.role);

  // SuperAdmin (admin) can only access an explicit allowlist.
  if (normalizedUserRole === 'admin') {
    const path = location.pathname;
    const superAdminAllowed = [
      '/superadmin',
      '/profile',
      '/change-password',
    ];
    const isAllowed = superAdminAllowed.includes(path) || path.startsWith('/event/');
    if (!isAllowed) {
      return <Navigate to={getRoleHomeRoute(normalizedUserRole)} replace />;
    }

    if (role) {
      const normalizedRoles = Array.isArray(role) ? role.map(normalizeRole) : [normalizeRole(role)];
      if (!normalizedRoles.includes('admin')) return <Navigate to={getRoleHomeRoute(normalizedUserRole)} replace />;
    }

    return children;
  }

  // Check specific role requirement
  if (role) {
    const normalizedRoles = Array.isArray(role) ? role.map(normalizeRole) : [normalizeRole(role)];

    if (Array.isArray(role)) {
      if (!normalizedRoles.includes(normalizedUserRole)) return <Navigate to={getRoleHomeRoute(normalizedUserRole)} replace />;
    } else {
      if (!normalizedRoles.includes(normalizedUserRole)) return <Navigate to={getRoleHomeRoute(normalizedUserRole)} replace />;
    }
  }

  // Handle unapproved College Admins
  if (normalizedUserRole === 'college_admin' && !user.isApproved) {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

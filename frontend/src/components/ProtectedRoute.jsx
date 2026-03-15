import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // SuperAdmin (admin) can only access an explicit allowlist.
  if (user.role === 'admin') {
    const path = location.pathname;
    const superAdminAllowed = [
      '/superadmin',
      '/profile',
      '/change-password',
    ];
    const isAllowed = superAdminAllowed.includes(path) || path.startsWith('/event/');
    if (!isAllowed) {
      return <Navigate to="/superadmin" replace />;
    }

    if (role) {
      if (Array.isArray(role) && !role.includes('admin')) return <Navigate to="/superadmin" replace />;
      if (!Array.isArray(role) && role !== 'admin') return <Navigate to="/superadmin" replace />;
    }

    return children;
  }

  // Check specific role requirement
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/campus-feed" />;
    } else {
      if (user.role !== role) return <Navigate to="/campus-feed" />;
    }
  }

  // Handle unapproved College Admins
  if (user.role === 'college_admin' && !user.isApproved) {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" />;
    }
  }

  return children;
};

export default ProtectedRoute;

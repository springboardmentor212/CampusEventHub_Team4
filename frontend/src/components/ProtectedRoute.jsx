import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  // SuperAdmin (role: 'admin') can access everything
  if (user.role === 'admin') return children;

  // Check specific role requirement
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/login" />;
    } else {
      if (user.role !== role) return <Navigate to="/login" />;
    }
  }

  // Handle unapproved College Admins
  if (user.role === 'college_admin' && !user.isApproved) {
    // Only allow them to stay on their dashboard
    if (location.pathname !== '/college-admin') {
      return <Navigate to="/college-admin" />;
    }
  }

  return children;
};

export default ProtectedRoute;

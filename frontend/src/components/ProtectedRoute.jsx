import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // SuperAdmin (role: 'admin') can access everything
  if (user.role === 'admin') return children;

  // Check specific role requirement
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/student" />;
    } else {
      if (user.role !== role) return <Navigate to="/student" />;
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

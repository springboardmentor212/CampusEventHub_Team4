import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CollegeAdminDashboard from "./pages/CollegeAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import ManageEvents from "./pages/ManageEvents";
import EventRegistrations from "./pages/EventRegistrations";
import EventDetail from "./pages/EventDetail";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmail from "./pages/VerifyEmail";
import DeleteAccount from "./pages/DeleteAccount";
import ResendVerification from "./pages/ResendVerification";
import Policies from "./pages/Policies";
import PrivacyTerms from "./pages/PrivacyTerms";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import NotMe from "./pages/NotMe";
import StudentApprovals from "./pages/StudentApprovals";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/delete-account/:token" element={<DeleteAccount />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/privacy-terms" element={<PrivacyTerms />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute role={["student", "admin"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route path="/not-me" element={<NotMe />} />
          <Route
            path="/admin/student-approvals"
            element={
              <ProtectedRoute role="college_admin">
                <StudentApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute role="college_admin">
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-events"
            element={
              <ProtectedRoute role="college_admin">
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-registrations/:id"
            element={
              <ProtectedRoute role="college_admin">
                <EventRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-event/:id"
            element={
              <ProtectedRoute role="college_admin">
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campus-feed"
            element={
              <ProtectedRoute role={["student", "college_admin"]}>
                <StudentDashboard view="alias" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard view="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/explore"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard view="explore" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-events"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard view="my-events" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/activity"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard view="activity" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route
            path="/students"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route
            path="/student-dashboard"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event/:id"
            element={
              <ProtectedRoute role={["student", "college_admin", "admin"]}>
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="college_admin">
                <CollegeAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/college-admin"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="/college_admin"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin"
            element={<Navigate to="/superadmin" replace />}
          />
          <Route
            path="/super_admin"
            element={<Navigate to="/superadmin" replace />}
          />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

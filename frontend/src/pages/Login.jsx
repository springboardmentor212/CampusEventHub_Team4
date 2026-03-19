import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import FormInput from "../components/FormInput";
import { getRoleHomeRoute } from "../utils/roleRoutes";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    if (user) {
      navigate(getRoleHomeRoute(user.role));
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusError(null);

    const loadingToast = toast.loading("Checking your details...");

    try {
      const loggedUser = await login(email, password);
      toast.success("Welcome back.", { id: loadingToast });
      navigate(getRoleHomeRoute(loggedUser.role));
    } catch (err) {
      const errorData = err.response?.data;
      setStatusError({
        code: errorData?.code || "INVALID_CREDENTIALS",
        message: errorData?.message || "That email and password combination didn't match our records.",
      });
      toast.dismiss(loadingToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorTitle = {
    EMAIL_NOT_VERIFIED: "Check your email first",
    PENDING_APPROVAL: "Your account is still being reviewed",
    ACCOUNT_BLOCKED: "This account is currently blocked",
    ACCOUNT_INACTIVE: "This account is not active yet",
    INVALID_CREDENTIALS: "We couldn't sign you in",
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Secure sign in
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign in to pick up where you left off and get back to your campus dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email address"
              icon={Mail}
              type="email"
              placeholder="name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <FormInput
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:text-indigo-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Forgot your password?
              </Link>
            </div>

            {statusError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-900">
                  {errorTitle[statusError.code] || "We couldn't sign you in"}
                </p>
                <p className="mt-1 text-sm leading-6 text-rose-700">
                  {statusError.message}
                </p>
                {statusError.code === "EMAIL_NOT_VERIFIED" && (
                  <div className="mt-3">
                    <Link
                      to="/resend-verification"
                      className="text-sm font-medium text-rose-800 underline underline-offset-4"
                    >
                      Send the verification link again
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing you in
                </>
              ) : (
                <>
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="border-t border-slate-200 pt-5 text-center">
              <p className="text-sm text-slate-600">
                New here?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  Create your account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
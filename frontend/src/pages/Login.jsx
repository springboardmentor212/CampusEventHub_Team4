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
  Loader2
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
    const loadingToast = toast.loading("Verifying access...");
    try {
      const loggedUser = await login(email, password);
      toast.success("Welcome back!", { id: loadingToast });

      navigate(getRoleHomeRoute(loggedUser.role));
    } catch (err) {
      const errorData = err.response?.data;
      setStatusError({
          code: errorData?.code || "INVALID_CREDENTIALS",
          message: errorData?.message || "Incorrect email or password."
      });
      toast.dismiss(loadingToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-y-auto">
      {/* Visual Section */}
      <div className="hidden md:flex md:w-1/2 relative p-12 bg-slate-50 border-r border-slate-100 items-center justify-center">
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col">
          <div className="mb-8">
            <span className="inline-badge">University Partner</span>
            <h1 className="editorial-header mt-4">
              Connect. Engage. Succeed.
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              The simplest way to discover and manage campus events.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <img
              src="/images/campus_life_professional.png"
              alt="Campus Life"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <header className="mb-10 text-slate-900">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium">Access your campus dashboard</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="uday.somapuram@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex justify-end -mt-4">
              <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot Password?</Link>
            </div>

            {statusError && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 animate-shake text-slate-900">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-white">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-900 leading-tight mb-1">
                      {statusError.code === "EMAIL_NOT_VERIFIED" && "Email Not Verified"}
                      {statusError.code === "PENDING_APPROVAL" && "Pending Approval"}
                      {statusError.code === "ACCOUNT_BLOCKED" && "Account Blocked"}
                      {statusError.code === "ACCOUNT_INACTIVE" && "Account Inactive"}
                      {statusError.code === "INVALID_CREDENTIALS" && "Access Denied"}
                    </p>
                    <p className="text-xs font-medium text-rose-600 leading-relaxed uppercase tracking-wide">
                      {statusError.message}
                    </p>
                    {statusError.code === "EMAIL_NOT_VERIFIED" && (
                      <div className="mt-3">
                        <Link to="/resend-verification" className="text-xs font-black text-rose-700 hover:text-rose-800 underline underline-offset-4 decoration-rose-300">
                          Resend Verification Link
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="hero-btn w-full mt-2"
            >
              {isSubmitting ? (
                 <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                 </>
              ) : (
                <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-6 text-center text-slate-900">
              <p className="text-sm font-medium text-slate-500">
                New member?{" "}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Create an account</Link>
              </p>
            </div>
          </form>

          {/* Minimal Trust Footer */}
          <div className="mt-12 flex items-center justify-center gap-6 border-t border-slate-100 pt-8 opacity-60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

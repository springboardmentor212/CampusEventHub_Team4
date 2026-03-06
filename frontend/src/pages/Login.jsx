import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Calendar,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Authenticating secure credentials...");
    try {
      const loggedUser = await login(email, password);
      toast.success("Identity verified. Welcome back.", { id: loadingToast });

      if (loggedUser.role === "admin") navigate("/admin");
      else if (loggedUser.role === "college_admin") navigate("/college-admin");
      else navigate("/student");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[480px] animate-fade-in z-10">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-10 pb-4 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                <Calendar className="text-white w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CampusEventHub</h1>
            <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest text-[10px]">Institutional Control Center</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-10 pt-6 space-y-7">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Access Secret</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider hover:underline">Reset</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-sm font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="metallic-btn w-full py-4 mt-4 shadow-indigo-100"
            >
              Authorize Access
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-6 border-t border-slate-50 text-center space-y-4">
              <p className="text-xs font-bold text-slate-400">
                No authorized profile?{" "}
                <Link to="/register" className="text-indigo-600 hover:underline underline-offset-4">Register Account</Link>
              </p>
              <Link to="/resend-verification" className="block text-[10px] font-extrabold text-slate-300 hover:text-indigo-600 uppercase tracking-[0.15em] transition-colors">
                Request Verification Link
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">SSL Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Version 2.4.0</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

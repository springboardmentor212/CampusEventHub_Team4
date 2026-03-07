import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormInput from "../components/FormInput";
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  MailCheck,
  AlertTriangle,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeId: "",
    role: "student",
    officialId: "",
  });
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/superadmin");
      else if (user.role === "college_admin") navigate("/admin");
      else navigate("/student");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await API.get("/colleges");
        if (res.data.success) setColleges(res.data.data.colleges);
      } catch (err) {
        toast.error("Failed to load university list");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Security secrets do not match");
      return;
    }
    if (!form.collegeId) {
      toast.error("Institution selection required");
      return;
    }

    const loadingToast = toast.loading("Creating profile...");
    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      firstName,
      lastName,
      collegeId: form.collegeId,
      role: form.role,
      officialId: form.officialId,
    };

    try {
      const res = await API.post("/auth/register", payload);
      toast.success("Profile initialized", { id: loadingToast });
      setRegisteredEmail(res.data.data?.email || form.email);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", { id: loadingToast });
    }
  };

  if (registeredEmail) {
    const isAdmin = form.role === "college_admin";
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-fade-in">
        <div className="glass-card p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-8">
            <MailCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 italic">Verification Required.</h1>
          <p className="text-slate-500 mb-6 leading-relaxed">
            We've transmitted a specialized identity bridge to: <br />
            <span className="font-bold text-slate-900">{registeredEmail}</span>
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">Next Steps Sequence</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <p className="text-xs font-bold text-slate-600">Access your institutional inbox and verify your identity.</p>
              </div>
              {isAdmin ? (
                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">2</div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">The <span className="text-indigo-600">SuperAdmin</span> will then review your credentials. You'll receive a final authorization email once approved.</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">2</div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">Proceed to <span className="text-indigo-600">Login</span> to start exploring the campus feed.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/login" className="hero-btn w-full italic">Continue to Login</Link>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Identity record will be purged if not verified within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Column (Visual) */}
      <div className="hidden md:flex md:w-2/5 relative p-12 bg-slate-50 border-r border-slate-100 flex-col justify-center items-center">
        <div className="max-w-md mx-auto">
          <span className="inline-badge mb-6">Discovery Awaits</span>
          <h1 className="editorial-header mb-6">Discovery Awaits.</h1>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Join the community. Discover workshops, sports, and cultural events happening right next to you.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <img
              src="/images/campus_life_professional.png"
              alt="Campus Life"
              className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-8 md:p-16 lg:p-24 flex flex-col items-center">
        <div className="w-full max-w-xl animate-fade-in">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2 font-medium">Join your institution's digital ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Username"
                icon={User}
                required
                placeholder="uday.s"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <FormInput
                label="Full Name"
                icon={User}
                required
                placeholder="UDAY SOMAPURAM"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <FormInput
                label="University Email"
                icon={Mail}
                required
                type="email"
                placeholder="uday.somapuram@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <FormInput
                label="Student/Staff ID"
                icon={ShieldCheck}
                required
                placeholder="ID-2026-UDAY"
                value={form.officialId}
                onChange={(e) => setForm({ ...form, officialId: e.target.value })}
              />

              <FormInput
                label="Institution"
                icon={ChevronDown}
                required
                value={form.collegeId}
                onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
              >
                <option value="">{loadingColleges ? "Loading..." : "Select College"}</option>
                {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </FormInput>

              <FormInput
                label="Account Type"
                icon={ChevronDown}
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                suffix={<ChevronDown className="w-4 h-4 text-slate-400" />}
              >
                <option value="student">Student</option>
                <option value="college_admin">College Admin</option>
              </FormInput>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <FormInput
                label="Password"
                icon={Lock}
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <FormInput
                label="Confirm Password"
                icon={Lock}
                required
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-6">
              <button type="submit" className="hero-btn w-full">
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              Already a user?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Sign in</Link>
            </p>
          </form>

          <p className="mt-12 text-[11px] text-center text-slate-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            By signing up, you agree to our <span className="underline decoration-slate-200">System Policies</span> and <span className="underline decoration-slate-200">Code of Conduct</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


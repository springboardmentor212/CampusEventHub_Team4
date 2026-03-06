import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Badge,
  School,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MailCheck,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

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
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const res = await API.get("/colleges");
        if (res.data.success) setColleges(res.data.data.colleges);
      } catch (err) {
        toast.error("Failed to sync university database");
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

    const loadingToast = toast.loading("Establishing secure profile...");
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
      toast.error(err.response?.data?.message || "Initialization failed", { id: loadingToast });
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-12 max-w-lg w-full text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-100 shadow-lg shadow-emerald-50/50">
            <MailCheck className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Transmission Sent</h1>
          <p className="text-slate-500 font-medium mb-2">We've dispatched a verification link to:</p>
          <p className="font-black text-indigo-600 mb-8 break-all">{registeredEmail}</p>

          <div className="bg-slate-50 rounded-3xl p-6 text-left mb-8 border border-slate-100 space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wide leading-relaxed">Activate via "Verify Account" link</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wide leading-relaxed">Expires after 24 hours of inactivity</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/resend-verification" className="block text-[10px] font-extrabold text-indigo-600 uppercase tracking-[0.2em] hover:opacity-80 transition-all">Request New Link</Link>
            <Link to="/login" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] hover:opacity-80 transition-all pt-4 border-t border-slate-100">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl animate-fade-in z-10 my-10">
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 overflow-hidden">
          <div className="p-10 pb-6 text-center border-b border-slate-50">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Establish Profile</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">CampusEventHub Identity Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Network Alias</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    placeholder="johndoe_hub"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Identity</label>
                <div className="relative group">
                  <Badge className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    placeholder="Johnathon Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    type="email"
                    placeholder="j.doe@university.edu"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Official ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">University Roll / ID</label>
                <div className="relative group">
                  <Badge className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    placeholder="ID-99283-X"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.officialId}
                    onChange={(e) => setForm({ ...form, officialId: e.target.value })}
                  />
                </div>
              </div>

              {/* College Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Parent Institution</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <select
                    required
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                    value={form.collegeId}
                    onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                  >
                    <option value="">{loadingColleges ? "Syncing..." : "Select Affiliation"}</option>
                    {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Role</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <select
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">Student Investigator</option>
                    <option value="college_admin">Campus Administrator</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Notification Alert */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 items-center">
              <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0" />
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-relaxed">
                {form.role === 'college_admin'
                  ? "Administrator access requires SuperAdmin audit."
                  : "Student profiles require Campus Admin verification."}
              </p>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Security Secret</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Secret</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="metallic-btn w-full py-5 text-base shadow-indigo-100">
              Establish Institutional Identity
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Existing Profile? <Link to="/login" className="text-indigo-600 hover:opacity-80 transition-all">Authenticate Now</Link>
            </p>
          </form>
        </div>

        <p className="mt-8 text-[9px] font-extrabold text-center text-slate-400 uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
          By establishing a profile, you adhere to the <span className="text-slate-900 border-b border-slate-200">Protocol for Campus Conduct</span> and <span className="text-slate-900 border-b border-slate-200">Data Integrity Guidelines</span>.
        </p>
      </div>
    </div>
  );
};

export default Register;
